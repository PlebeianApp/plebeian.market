<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import QrCode from '@castlenine/svelte-qrcode'
	import { Invoice } from '@getalby/lightning-tools'
	import { page } from '$app/stores'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import ndkStore from '$lib/stores/ndk'
	import { canPayWithNWC } from '$lib/stores/nwc'
	import { copyToClipboard, formatSats } from '$lib/utils'
	import {
		addZapRelaysToNDKPool,
		formatTime,
		generateLightningInvoice,
		handleNWCPayment,
		handleWebLNPayment,
		setupExpiryCountdown,
		startPaymentChecking,
	} from '$lib/utils/zap.utils'
	import { afterUpdate, createEventDispatcher, onDestroy } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { PageData } from '../../../routes/$types'
	import type { CheckoutPaymentEvent, PaymentStatus } from '../checkout/types'

	$: ({ appSettings } = $page.data as PageData)
	export let paymentDetail: RichPaymentDetail
	export let amountSats: number
	export let paymentType: string

	const dispatch = createEventDispatcher<{
		paymentComplete: CheckoutPaymentEvent
		paymentExpired: CheckoutPaymentEvent
		paymentCancelled: CheckoutPaymentEvent
	}>()

	let invoice: Invoice | null = null
	let paymentStatus: PaymentStatus = 'pending'
	let preimageInput = ''
	let showPreimageInput = false
	let isLoading = false
	let expiryTime: Date | null = null
	let remainingTime = 'Calculating...'
	let isCheckingPayment = false
	let showManualVerification = false
	let normalizedAmount = formatSats(amountSats, false)

	$: url = 'lightning://' + invoice?.paymentRequest
	$: canUseNWC = canPayWithNWC(amountSats)

	let prevPaymentDetail: RichPaymentDetail | null = null
	let prevAmountSats: number | null = null

	const cleanupFunctions: (() => void)[] = []

	async function generateInvoice() {
		if (isLoading || invoice || normalizedAmount == 0) return
		isLoading = true
		try {
			const {
				invoice: generatedInvoice,
				allowsNostr,
				lightningAddress,
			} = await generateLightningInvoice(
				paymentDetail.paymentDetails,
				normalizedAmount,
				'', // Zap msg
				{ ndk: $ndkStore },
			)

			invoice = generatedInvoice
			addZapRelaysToNDKPool($ndkStore)

			if (allowsNostr) {
				const cleanup = startPaymentChecking(invoice, (preimage) => handleSuccessfulPayment(preimage), {
					isGetalby: lightningAddress.domain === 'getalby.com',
					onManualVerificationNeeded: () => (showManualVerification = true),
				})
				cleanupFunctions.push(cleanup)
			}

			setupInvoiceExpiry()
		} catch (error) {
			console.error('Error generating invoice:', error)
			toast.error('Failed to generate invoice')
		} finally {
			isLoading = false
		}
	}

	function setupInvoiceExpiry() {
		if (invoice?.paymentRequest && invoice.expiry) {
			expiryTime = new Date(Date.now() + invoice.expiry * 1000)
			const cleanup = setupExpiryCountdown(
				expiryTime,
				(secondsLeft) => {
					remainingTime = formatTime(secondsLeft)
				},
				() => {
					handleExpiry()
				},
			)
			cleanupFunctions.push(cleanup)
		} else {
			remainingTime = 'No expiry set'
			toast.warning('This invoice does not have an expiry time set.')
		}
	}

	async function verifyPayment() {
		if (!invoice || !preimageInput) {
			toast.error('Please enter a preimage to verify the payment.')
			return
		}

		isLoading = true
		try {
			const paid = invoice.validatePreimage(preimageInput)
			paid ? handleSuccessfulPayment(preimageInput) : toast.error('Invalid preimage. Please try again.')
		} catch (error) {
			console.error('Error verifying payment:', error)
			toast.error('Failed to verify payment')
		} finally {
			isLoading = false
		}
	}

	function handleSuccessfulPayment(preimage: string) {
		paymentStatus = 'success'
		toast.success('Payment successful')
		dispatch('paymentComplete', {
			paymentRequest: invoice!.paymentRequest,
			proof: preimage,
			amountSats: normalizedAmount,
			paymentType,
		})
		cleanupFunctions.forEach((fn) => fn())
	}

	function handleExpiry() {
		cleanupFunctions.forEach((fn) => fn())
		remainingTime = 'Expired'
		toast.error('Invoice expired')
		dispatch('paymentExpired', {
			paymentRequest: invoice!.paymentRequest,
			proof: null,
			amountSats: normalizedAmount,
			paymentType,
		})
	}

	function handleSkipPayment() {
		paymentStatus = 'cancelled'
		cleanupFunctions.forEach((fn) => fn())
		dispatch('paymentCancelled', {
			paymentRequest: invoice!.paymentRequest,
			proof: null,
			amountSats: normalizedAmount,
			paymentType,
		})
	}

	function handleSkipInvalidPayment() {
		paymentStatus = 'cancelled'
		cleanupFunctions.forEach((fn) => fn())
		dispatch('paymentCancelled', {
			paymentRequest: null,
			proof: null,
			amountSats: normalizedAmount,
			paymentType,
		})
	}

	async function handleWeblnPay() {
		if (!invoice || !('webln' in window)) return

		isLoading = true

		await handleWebLNPayment(
			invoice,
			(preimage) => {
				handleSuccessfulPayment(preimage)
			},
			(error) => {
				toast.error(`WebLN payment failed: ${error}`)
			},
		)

		isLoading = false
	}

	export async function handleNWCPay() {
		if (!invoice) return

		isLoading = true

		await handleNWCPayment(
			invoice,
			async (preimage) => {
				handleSuccessfulPayment(preimage)
			},
			(error) => {
				toast.error(`NWC payment failed: ${error}`)
			},
		)

		isLoading = false
	}

	function handleCopyInvoice() {
		if (invoice?.paymentRequest) {
			copyToClipboard(invoice.paymentRequest)
			toast.success('Invoice copied to clipboard')
		}
	}

	function reset() {
		invoice = null
		paymentStatus = 'pending'
		isLoading = false
		cleanupFunctions.forEach((fn) => fn())
		cleanupFunctions.length = 0
	}

	function shouldUpdateInvoice() {
		if (!prevPaymentDetail || !prevAmountSats) return true
		return (
			prevPaymentDetail.paymentMethod !== paymentDetail.paymentMethod ||
			prevPaymentDetail.paymentDetails !== paymentDetail.paymentDetails ||
			prevAmountSats !== normalizedAmount
		)
	}

	afterUpdate(() => {
		if (shouldUpdateInvoice() && normalizedAmount > 0) {
			reset()
			generateInvoice()
			prevPaymentDetail = { ...paymentDetail }
			prevAmountSats = normalizedAmount
		}
	})

	onDestroy(() => cleanupFunctions.forEach((fn) => fn()))
</script>

<div class="flex flex-col items-center gap-4">
	<h3 class="font-bold">{paymentDetail.paymentMethod}</h3>
	<p class="text-ellipsis overflow-hidden ...">{paymentDetail.paymentDetails}</p>

	{#if isLoading}
		<Spinner />
	{:else if invoice}
		<a href={url} class="block hover:opacity-90 transition-opacity" target="_blank" rel="noopener noreferrer">
			{#key invoice.paymentRequest}
				<QrCode data={invoice.paymentRequest} logoPath={appSettings.logoUrl} />
			{/key}
		</a>
		<Button variant="tertiary" class="items-center gap-2 grid grid-cols-[auto_auto] max-w-full" on:click={handleCopyInvoice}>
			<span class=" truncate">{invoice.paymentRequest}</span>
			<span class="i-tdesign-copy" />
		</Button>
		<p class="text-sm">Expires in: {remainingTime}</p>

		{#if isCheckingPayment}
			<div class="flex items-center gap-2">
				<Spinner />
				<span>Checking payment...</span>
			</div>
		{/if}

		<div class="flex flex-wrap gap-2 justify-center">
			{#if 'webln' in window}
				<Button variant="primary" on:click={handleWeblnPay} disabled={paymentStatus !== 'pending'}>Pay with WebLN</Button>
			{/if}
			{#if canUseNWC}
				<Button variant="primary" on:click={handleNWCPay} disabled={paymentStatus !== 'pending'}>Pay with NWC</Button>
			{/if}
			<Button variant="outline" on:click={() => window.open(url, '_blank')}>Open in wallet</Button>
			{#if showManualVerification}
				<Button variant="primary" on:click={() => (showPreimageInput = true)}>I've already paid</Button>
			{/if}
			<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
		</div>

		<Collapsible.Root open={showPreimageInput}>
			<Collapsible.Content>
				<span
					>If you've paid but it wasn't detected, find the payment preimage in your wallet and paste it here. Can't find it? Skip this step
					and contact the merchant directly to proceed.</span
				>
				<div class="flex flex-col gap-2">
					<Input placeholder="Enter preimage" bind:value={preimageInput} />
					<Button variant="primary" on:click={verifyPayment} disabled={paymentStatus !== 'pending'}>Verify Payment</Button>
				</div>
			</Collapsible.Content>
		</Collapsible.Root>
	{:else}
		{#if normalizedAmount}
			<p>Generating invoice...</p>
		{:else}
			<p>No amount specified, or amount is too small</p>
		{/if}
		<Button variant="outline" on:click={handleSkipInvalidPayment}>Skip Payment</Button>
	{/if}

	{#if paymentStatus === 'success'}
		<p class="text-green-500">Payment successful!</p>
	{:else if paymentStatus === 'failed'}
		<p class="text-red-500">Payment failed. Please try again.</p>
	{/if}
</div>
