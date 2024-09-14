<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import QrCode from '@castlenine/svelte-qrcode'
	import { Invoice, LightningAddress } from '@getalby/lightning-tools'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import { balanceOfWorkingNWCs, payInvoiceWithFirstWorkingNWC } from '$lib/stores/nwc'
	import { copyToClipboard, formatSats, truncateText } from '$lib/utils'
	import { NIP05_REGEX } from 'nostr-tools/nip05'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number

	const dispatch = createEventDispatcher()

	let invoice: Invoice | null = null
	let paymentStatus: 'pending' | 'success' | 'failed' = 'pending'
	let preimageInput = ''
	let showPreimageInput = false
	let isLoading = false
	let expiryTimestamp: number | null = null
	let timeLeft: number | null = null
	let interval: ReturnType<typeof setInterval> | undefined

	$: url = 'lightning://' + invoice?.paymentRequest
	$: canPayWithNWC = $balanceOfWorkingNWCs >= amountSats

	async function generateInvoice() {
		isLoading = true
		try {
			if (NIP05_REGEX.test(paymentDetail.paymentDetails)) {
				const ln = new LightningAddress(paymentDetail.paymentDetails)
				await ln.fetch()
				invoice = await ln.requestInvoice({ satoshi: amountSats.toFixed(0) })
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

	function setupExpiryCountdown() {
		// FIXME expiry is not beign calculated properly
		if (invoice?.paymentRequest) {
			console.log('Expiry timestamp:', invoice.expiry)
			expiryTimestamp = Date.now() / 1000 + invoice.expiryDate
			clearInterval(interval)
			interval = setInterval(() => {
				if (expiryTimestamp !== null) {
					const now = Date.now() / 1000
					timeLeft = Math.max(0, Math.floor(expiryTimestamp - now))

					if (timeLeft <= 0) {
						handleExpiry()
					}
				}
			}, 1000)
		}
	}

	function handleExpiry() {
		clearInterval(interval)
		toast.error('Invoice expired')
		dispatch('paymentExpired')
	}

	async function verifyPayment() {
		isLoading = true
		try {
			if (invoice) {
				if (preimageInput) {
					const paid = await invoice.validatePreimage(preimageInput)
					if (paid) {
						handleSuccessfulPayment(preimageInput)
					} else {
						toast.error('Invalid preimage. Please try again.')
					}
				} else {
					const paid = await invoice.isPaid()
					if (paid) {
						handleSuccessfulPayment(invoice.preimage)
					} else {
						toast.error('Payment not detected. Please try again.')
					}
				}
			}
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
		dispatch('paymentComplete', { preimage })
	}

	async function handlePayment() {
		if (!invoice) {
			await generateInvoice()
		}
		showPreimageInput = true
	}

	async function handleWeblnPay() {
		isLoading = true
		try {
			if (invoice && 'webln' in window) {
				await window.webln.enable()
				const response = await window.webln.sendPayment(invoice.paymentRequest)
				const paid = await invoice.validatePreimage(response.preimage)
				if (paid) {
					handleSuccessfulPayment(response.preimage)
				}
			}
		} catch (error) {
			console.error('WebLN payment error:', error)
			toast.error('WebLN payment failed')
		} finally {
			isLoading = false
		}
	}

	async function handleNWCPay() {
		isLoading = true
		try {
			if (invoice) {
				const paidInvoice = await payInvoiceWithFirstWorkingNWC(invoice.paymentRequest)
				if (!paidInvoice.error) {
					handleSuccessfulPayment(paidInvoice.preimage)
				} else {
					throw new Error(paidInvoice.error)
				}
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

	function formatTime(seconds: number | null): string {
		if (seconds === null) return '--:--'
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	}

	onMount(() => {
		generateInvoice()
	})

	onDestroy(() => {
		if (interval) clearInterval(interval)
	})
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
		<p class="text-sm">Expires in: {formatTime(timeLeft)}</p>

		<div class="flex gap-2">
			<Button on:click={handlePayment} disabled={paymentStatus !== 'pending'}>I've already paid</Button>
			{#if 'webln' in window}
				<Button on:click={handleWeblnPay} disabled={paymentStatus !== 'pending'}>Pay with WebLN</Button>
			{/if}
			{#if canPayWithNWC}
				<Button on:click={handleNWCPay} disabled={paymentStatus !== 'pending'}>Pay with NWC</Button>
			{/if}
			<Button variant="ghost" on:click={() => window.open(url, '_blank')}>Open in wallet</Button>
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
