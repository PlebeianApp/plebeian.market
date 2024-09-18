<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import QrCode from '@castlenine/svelte-qrcode'
	import { Invoice, LightningAddress } from '@getalby/lightning-tools'
	import { NDKKind, NDKRelay } from '@nostr-dev-kit/ndk'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import ndkStore, { GenericKeySigner } from '$lib/stores/ndk'
	import { balanceOfWorkingNWCs, payInvoiceWithFirstWorkingNWC } from '$lib/stores/nwc'
	import { copyToClipboard, formatSats, truncateText } from '$lib/utils'
	import { addSeconds, differenceInSeconds, format } from 'date-fns'
	import { NIP05_REGEX } from 'nostr-tools/nip05'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number

	const dispatch = createEventDispatcher<{
		paymentComplete: { paymentRequest: string; preimage: string | null }
		paymentExpired: { paymentRequest: string; preimage: string | null }
		paymentCanceled: { paymentRequest: string; preimage: string | null }
	}>()
	const RELAYS = ['wss://relay.damus.io', 'wss://relay.nostr.band', 'wss://nos.lol', 'wss://relay.nostr.net', 'wss://relay.minibits.cash']

	let invoice: Invoice | null = null
	let paymentStatus: 'pending' | 'success' | 'failed' | 'canceled' = 'pending'
	let preimageInput = ''
	let showPreimageInput = false
	let isLoading = false
	let expiryTime: Date | null = null
	let remainingTime: string = 'Calculating...'
	let countdownInterval: ReturnType<typeof setInterval> | undefined
	let paymentCheckInterval: ReturnType<typeof setInterval> | undefined
	let allowsNostr: boolean | null = null
	let ln: LightningAddress | null = null
	let zapSubscription: ReturnType<typeof $ndkStore.subscribe> | undefined
	let isCheckingPayment = false
	let showManualVerification = false
	let manualVerificationTimeout: ReturnType<typeof setTimeout> | undefined

	$: url = 'lightning://' + invoice?.paymentRequest
	$: canPayWithNWC = $balanceOfWorkingNWCs >= amountSats
	// FIXME: if you skip the payment it the paymentdetail gets fetched multiple times `await ln.fetch()`
	async function generateInvoice() {
		isLoading = true
		try {
			if (NIP05_REGEX.test(paymentDetail.paymentDetails)) {
				ln = new LightningAddress(paymentDetail.paymentDetails)
				await ln.fetch()
				allowsNostr = ln.lnurlpData?.allowsNostr ?? false

				addRelaysToNDKPool()

				invoice = allowsNostr ? await generateZapInvoice() : await ln.requestInvoice({ satoshi: formatSats(amountSats, false) })
				if (allowsNostr) {
					console.log(ln)
					ln.domain === 'getalby.com' ? startZapCheck() : startZapSubscription()
				}
			} else {
				invoice = new Invoice({ pr: paymentDetail.paymentDetails })
			}
			setupExpiryCountdown()
		} catch (error) {
			console.error('Error generating invoice:', error)
			toast.error('Failed to generate invoice')
		} finally {
			isLoading = false
		}
	}

	function addRelaysToNDKPool() {
		RELAYS.forEach((url) => {
			const relay = new NDKRelay(url, undefined, $ndkStore)
			$ndkStore.pool.addRelay(relay, true)
		})
	}

	async function generateZapInvoice() {
		const zapArgs = { satoshi: formatSats(amountSats, false), relays: RELAYS }
		return await ln!.zapInvoice(zapArgs, { nostr: new GenericKeySigner() })
	}

	function setupExpiryCountdown() {
		if (invoice?.paymentRequest && invoice.expiry) {
			expiryTime = addSeconds(new Date(), invoice.expiry)
			updateRemainingTime()
			clearInterval(countdownInterval)
			countdownInterval = setInterval(updateRemainingTime, 1000)
		} else {
			remainingTime = 'No expiry set'
			toast.warning('This invoice does not have an expiry time set.')
		}
	}

	function updateRemainingTime() {
		if (expiryTime) {
			const secondsRemaining = differenceInSeconds(expiryTime, new Date())
			if (secondsRemaining <= 0) {
				handleExpiry()
			} else {
				remainingTime = format(new Date(secondsRemaining * 1000), 'mm:ss')
			}
		}
	}

	function startZapSubscription() {
		if (invoice?.paymentRequest) {
			isCheckingPayment = true
			zapSubscription = $ndkStore.subscribe({ kinds: [NDKKind.Zap], since: Math.round(Date.now() / 1000) }).on('event', handleZapEvent)
			startManualVerificationTimer()
		}
	}

	function startZapCheck() {
		if (allowsNostr && invoice) {
			isCheckingPayment = true
			paymentCheckInterval = setInterval(async () => {
				try {
					const paid = await invoice?.isPaid()
					if (paid && invoice?.preimage) handleSuccessfulPayment(invoice.preimage)
				} catch (error) {
					console.error('Error checking zap payment:', error)
				}
			}, 750)
			startManualVerificationTimer()
		}
	}

	function startManualVerificationTimer() {
		manualVerificationTimeout = setTimeout(() => {
			showManualVerification = true
		}, 10000)
	}
	function handleZapEvent(event: NDKEvent) {
		const bolt11Tag = event.tagValue('bolt11')
		if (bolt11Tag && bolt11Tag === invoice?.paymentRequest) {
			handleSuccessfulPayment(event.tagValue('preimage') || 'No preimage present')
		}
	}

	function handleExpiry() {
		cleanupIntervals()
		remainingTime = 'Expired'
		toast.error('Invoice expired')
		dispatch('paymentExpired', { paymentRequest: invoice!.paymentRequest, preimage: null })
	}

	async function verifyPayment() {
		if (!invoice || !preimageInput) {
			toast.error('Please enter a preimage to verify the payment.')
			return
		}

		isLoading = true
		try {
			const paid = await invoice.validatePreimage(preimageInput)
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
		dispatch('paymentComplete', { paymentRequest: invoice!.paymentRequest, preimage })
		cleanupIntervals()
	}

	function handleSkipPayment() {
		paymentStatus = 'canceled'
		cleanupIntervals()
		dispatch('paymentCanceled', { paymentRequest: invoice!.paymentRequest, preimage: null })
	}

	async function handleWeblnPay() {
		if (!invoice || !('webln' in window)) return

		isLoading = true
		try {
			await window.webln.enable()
			const response = await window.webln.sendPayment(invoice.paymentRequest)
			const paid = await invoice.validatePreimage(response.preimage)
			if (paid) handleSuccessfulPayment(response.preimage)
		} catch (error) {
			console.error('WebLN payment error:', error)
			toast.error('WebLN payment failed')
		} finally {
			isLoading = false
		}
	}

	async function handleNWCPay() {
		if (!invoice) return

		isLoading = true
		try {
			const paidInvoice = await payInvoiceWithFirstWorkingNWC(invoice.paymentRequest)
			if (!paidInvoice.error && paidInvoice.result?.preimage) {
				handleSuccessfulPayment(paidInvoice.result.preimage)
			} else {
				throw new Error(`${paidInvoice.error}`)
			}
		} catch (error) {
			console.error('NWC payment error:', error)
			toast.error('NWC payment failed')
		} finally {
			isLoading = false
		}
	}

	function handleCopyInvoice() {
		if (invoice?.paymentRequest) {
			copyToClipboard(invoice.paymentRequest)
			toast.success('Invoice copied to clipboard')
		}
	}

	function cleanupIntervals() {
		clearInterval(countdownInterval)
		clearInterval(paymentCheckInterval)
		zapSubscription?.stop()
		isCheckingPayment = false
		showManualVerification = false
	}

	onMount(generateInvoice)
	onDestroy(cleanupIntervals)
</script>

<div class="flex flex-col items-center gap-4">
	<h3 class="font-bold">{paymentDetail.paymentMethod}</h3>
	<p>{paymentDetail.paymentDetails}</p>

	{#if isLoading}
		<Spinner />
	{:else if invoice}
		<QrCode data={invoice.paymentRequest} logoPath="/logo.svg" />
		<Button variant="secondary" class="flex items-center gap-2" on:click={handleCopyInvoice}>
			<span>{truncateText(invoice.paymentRequest, 30)}</span>
			<span class="i-tdesign-copy" />
		</Button>
		<p class="text-sm">Expires in: {remainingTime}</p>

		{#if isCheckingPayment}
			<div class="flex items-center gap-2">
				<Spinner />
				<span>Checking payment...</span>
			</div>
		{/if}

		<div class="flex gap-2">
			{#if allowsNostr === false || showManualVerification}
				<Button on:click={() => (showPreimageInput = true)} class="w-full mb-4">I've already paid</Button>
			{/if}
			{#if 'webln' in window}
				<Button on:click={handleWeblnPay} disabled={paymentStatus !== 'pending'}>Pay with WebLN</Button>
			{/if}
			{#if canPayWithNWC}
				<Button on:click={handleNWCPay} disabled={paymentStatus !== 'pending'}>Pay with NWC</Button>
			{/if}
			<Button variant="ghost" on:click={() => window.open(url, '_blank')}>Open in wallet</Button>
			<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
		</div>

		<Collapsible.Root open={showPreimageInput}>
			<Collapsible.Content>
				<div class="flex flex-col gap-2">
					<Input placeholder="Enter preimage" bind:value={preimageInput} />
					<Button on:click={verifyPayment} disabled={paymentStatus !== 'pending'}>Verify Payment</Button>
				</div>
			</Collapsible.Content>
		</Collapsible.Root>
	{:else}
		<p>Generating invoice...</p>
	{/if}

	{#if paymentStatus === 'success'}
		<p class="text-green-500">Payment successful!</p>
	{:else if paymentStatus === 'failed'}
		<p class="text-red-500">Payment failed. Please try again.</p>
	{/if}
</div>
