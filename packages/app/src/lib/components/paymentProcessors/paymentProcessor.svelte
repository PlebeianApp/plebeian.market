<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import { Button } from '$lib/components/ui/button'
	import { createEventDispatcher } from 'svelte'

	import type { PaymentProcessorMap } from './paymentProcessor'
	import LightningPaymentProcessor from './LightningPaymentProcessor.svelte'
	import OnChainPaymentProcessor from './OnChainPaymentProcessor.svelte'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number
	export let paymentId: string

	const dispatch = createEventDispatcher()

	const paymentProcessors: PaymentProcessorMap = {
		ln: {
			component: LightningPaymentProcessor,
			props: {},
		},
		'on-chain': {
			component: OnChainPaymentProcessor,
			props: {},
		},
		cashu: {
			component: null,
			props: {},
		},
		other: {
			component: null,
			props: {},
		},
	}

	$: currentProcessor = paymentProcessors[paymentDetail.paymentMethod]

	function handlePaymentEvent(event: CustomEvent) {
		dispatch(event.type, event.detail)
	}

	function handleSkipPayment() {
		dispatch('paymentCanceled', { paymentRequest: '', preimage: null, amountSats, paymentId })
	}
</script>

{#if currentProcessor && currentProcessor.component}
	<svelte:component
		this={currentProcessor.component}
		{paymentDetail}
		{amountSats}
		{paymentId}
		{...currentProcessor.props}
		on:paymentComplete={handlePaymentEvent}
		on:paymentExpired={handlePaymentEvent}
		on:paymentCanceled={handlePaymentEvent}
	/>
{:else}
	<div class="flex flex-col">
		<p>Unsupported payment method: {paymentDetail.paymentMethod}</p>
		<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
	</div>
{/if}
