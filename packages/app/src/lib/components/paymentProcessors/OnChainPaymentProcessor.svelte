<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import QrCode from '@castlenine/svelte-qrcode'
	import { copyToClipboard } from '$lib/utils'
	import { deriveAddresses, isExtendedPublicKey } from '$lib/utils/paymentDetails.utils'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { CheckoutPaymentEvent } from '../checkout/types'
	import Button from '../ui/button/button.svelte'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number

	const dispatch = createEventDispatcher<{
		paymentComplete: CheckoutPaymentEvent
		paymentExpired: CheckoutPaymentEvent
		paymentCanceled: CheckoutPaymentEvent
	}>()

	function handleSkipPayment() {
		dispatch('paymentCanceled', { paymentRequest: paymentDetail.paymentDetails, proof: null, amountSats, paymentType: 'on-chain' })
	}

	let addressToDisplay = isExtendedPublicKey(paymentDetail.paymentDetails)
		? deriveAddresses(paymentDetail.paymentDetails, 0)![0]
		: paymentDetail.paymentDetails
	$: if (isExtendedPublicKey(paymentDetail.paymentDetails)) addressToDisplay = deriveAddresses(paymentDetail.paymentDetails, 1)![0]
	else if (paymentDetail.paymentDetails.startsWith('bc1')) addressToDisplay = paymentDetail.paymentDetails

	function handleCopyInvoice() {
		if (addressToDisplay) {
			copyToClipboard(addressToDisplay)
			toast.success('Invoice copied to clipboard')
		}
	}
</script>

<div class="flex flex-col gap-2">
	{#if addressToDisplay}
		<QrCode data={addressToDisplay} logoPath="/logo.svg" />
		<Button variant="secondary" class="flex items-center gap-2" on:click={handleCopyInvoice}>
			<span>{addressToDisplay}</span>
			<span class="i-tdesign-copy" />
		</Button>
	{/if}
</div>
<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
