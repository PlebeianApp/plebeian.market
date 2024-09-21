<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import { createEventDispatcher } from 'svelte'

	import type { PaymentProcessorMap } from './paymentProcessor'
	import LightningPaymentProcessor from './LightningPaymentProcessor.svelte'
	import OnChainPaymentProcessor from './OnChainPaymentProcessor.svelte'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number

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
</script>

{#if currentProcessor && currentProcessor.component}
	<svelte:component
		this={currentProcessor.component}
		{paymentDetail}
		{amountSats}
		{...currentProcessor.props}
		on:paymentComplete={handlePaymentEvent}
		on:paymentExpired={handlePaymentEvent}
		on:paymentCanceled={handlePaymentEvent}
	/>
{:else}
	<p>Unsupported payment method: {paymentDetail.paymentMethod}</p>
{/if}
