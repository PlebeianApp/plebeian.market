<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import QrCode from '@castlenine/svelte-qrcode'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button'
	import { createMempoolAddressTransactionsQuery } from '$lib/fetch/mempool.queries'
	import { updateOnChainIndexMutation } from '$lib/fetch/wallets.mutations'
	import { copyToClipboard, satoshisToBtc } from '$lib/utils'
	import { formatTime, setupExpiryCountdown } from '$lib/utils/zap.utils'
	import { addMinutes } from 'date-fns'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { CheckoutPaymentEvent } from '../checkout/types'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number
	export let paymentType: string
	let expiryTime: Date | null = null
	let remainingTime = 'Calculating...'
	let cleanupExpiryCountdown: (() => void) | null = null

	const dispatch = createEventDispatcher<{
		paymentComplete: CheckoutPaymentEvent
		paymentExpired: CheckoutPaymentEvent
		paymentCanceled: CheckoutPaymentEvent
	}>()

	const mempoolQuery = createMempoolAddressTransactionsQuery(paymentDetail.paymentDetails, amountSats)

	$: if ($mempoolQuery.data && $mempoolQuery.data.length) {
		handleSuccessfulPayment($mempoolQuery.data[0].txid)
	}

	function handleSkipPayment() {
		dispatch('paymentCanceled', {
			paymentRequest: paymentDetail.paymentDetails,
			proof: null,
			amountSats,
			paymentType,
		})
	}

	function handleExpiredPayment() {
		dispatch('paymentExpired', {
			paymentRequest: paymentDetail.paymentDetails,
			proof: null,
			amountSats,
			paymentType,
		})
	}

	async function handleSuccessfulPayment(txId: string) {
		await $updateOnChainIndexMutation.mutateAsync(paymentDetail.id)
		dispatch('paymentComplete', {
			paymentRequest: paymentDetail.paymentDetails,
			proof: txId,
			amountSats,
			paymentType,
		})
		toast.success('Payment received!')
	}

	async function handleManualCheck() {
		await $mempoolQuery.refetch()
		if (!$mempoolQuery.data || $mempoolQuery.data.length === 0) {
			toast.error('Payment not detected yet.')
		}
	}

	function setupExpiry() {
		expiryTime = addMinutes(new Date(), 30)
		cleanupExpiryCountdown = setupExpiryCountdown(
			expiryTime,
			(secondsLeft) => {
				remainingTime = formatTime(secondsLeft)
			},
			() => {
				handleExpiredPayment()
			},
		)
	}

	onMount(() => {
		setupExpiry()
	})

	onDestroy(() => {
		if (cleanupExpiryCountdown) {
			cleanupExpiryCountdown()
		}
	})

	const bitcoinUri = `bitcoin:${paymentDetail.paymentDetails}?amount=${satoshisToBtc(amountSats)}`
</script>

<div class="flex flex-col items-center gap-4">
	<h3 class="font-bold">On-chain Payment</h3>

	<QrCode data={bitcoinUri} logoPath="/logo.svg" />

	<Button variant="secondary" class="items-center gap-2 grid grid-cols-[auto_auto] max-w-full" on:click={() => copyToClipboard(bitcoinUri)}>
		<span class="truncate">{paymentDetail.paymentDetails}</span>
		<span class="i-tdesign-copy" />
	</Button>
	<p class="text-sm">Expires in: {remainingTime}</p>

	{#if $mempoolQuery.isLoading || (!$mempoolQuery.data?.length && !$mempoolQuery.isError)}
		<div class="flex items-center gap-2">
			<Spinner />
			<span>Checking payment...</span>
		</div>
	{:else if $mempoolQuery.isError}
		<p class="text-red-500">Error checking payment status. Please try again.</p>
	{/if}
	<div class="flex flex-wrap gap-2 justify-center">
		<Button variant="ghost" on:click={() => window.open(bitcoinUri, '_blank')}>Open in wallet</Button>
		<Button variant="primary" on:click={handleManualCheck}>I've already paid</Button>
		<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
	</div>
</div>
