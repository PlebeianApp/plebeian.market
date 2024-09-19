<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import { createEventDispatcher } from 'svelte'

	import Button from '../ui/button/button.svelte'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number
	const dispatch = createEventDispatcher()

	function handleSkipPayment() {
		dispatch('paymentCanceled', { paymentRequest: paymentDetail.paymentDetails, preimage: null })
	}
</script>

<div>
	<h3>On-Chain Payment Processor</h3>
	<p>This feature is not yet implemented.</p>
	<p>Payment Method: {paymentDetail.paymentMethod}</p>
	<p>Amount: {amountSats} sats</p>
</div>
<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
