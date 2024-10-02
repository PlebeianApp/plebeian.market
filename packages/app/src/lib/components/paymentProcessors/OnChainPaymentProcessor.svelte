<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import QrCode from '@castlenine/svelte-qrcode'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button'
	import { createMempoolAddressTransactionsQuery } from '$lib/fetch/mempool.queries'
	import { updateOnChainIndexMutation } from '$lib/fetch/wallets.mutations'
	import { copyToClipboard, satoshisToBtc, truncateText } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { CheckoutPaymentEvent } from '../checkout/types'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number
	export let paymentType: string

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
		dispatch('paymentCanceled', { paymentRequest: paymentDetail.paymentDetails, proof: null, amountSats, paymentType })
	}

	async function handleSuccessfulPayment(txId: string) {
		dispatch('paymentComplete', { paymentRequest: paymentDetail.paymentDetails, proof: txId, amountSats, paymentType })
		await $updateOnChainIndexMutation.mutateAsync(paymentDetail.id)
		toast.success('Payment received!')
	}

	function handleCopyAddress() {
		if (paymentDetail.paymentDetails) {
			copyToClipboard(paymentDetail.paymentDetails)
			toast.success('Bitcoin address copied to clipboard')
		}
	}

	async function handleManualCheck() {
		await $mempoolQuery.refetch()
		if (!$mempoolQuery.data || $mempoolQuery.data.length === 0) {
			toast.error('Payment not detected yet.')
		}
	}

	const bitcoinUri = `bitcoin:${paymentDetail.paymentDetails}?amount=${satoshisToBtc(amountSats)}`
</script>

<div class="flex flex-col items-center gap-4">
	<h3 class="font-bold">On-chain Payment</h3>

	<QrCode data={bitcoinUri} logoPath="/logo.svg" />

	<Button variant="secondary" class="flex items-center gap-2" on:click={handleCopyAddress}>
		<span>{truncateText(paymentDetail.paymentDetails, 20)}</span>
		<span class="i-tdesign-copy" />
	</Button>

	<div class="flex flex-wrap gap-2 justify-center">
		<Button variant="ghost" on:click={() => window.open(bitcoinUri, '_blank')}>Open in wallet</Button>
		<Button on:click={handleManualCheck}>I've already paid</Button>
		<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
	</div>

	{#if $mempoolQuery.isLoading || (!$mempoolQuery.data?.length && !$mempoolQuery.isError)}
		<div class="flex items-center gap-2">
			<Spinner />
			<span>Checking payment...</span>
		</div>
	{:else if $mempoolQuery.isError}
		<p class="text-red-500">Error checking payment status. Please try again.</p>
	{/if}
</div>
