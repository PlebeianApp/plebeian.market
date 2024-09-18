<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number
</script>

<div>
	<h3>On-Chain Payment Processor</h3>
	<p>This feature is not yet implemented.</p>
	<p>Payment Method: {paymentDetail.paymentMethod}</p>
	<p>Amount: {amountSats} sats</p>
</div>
