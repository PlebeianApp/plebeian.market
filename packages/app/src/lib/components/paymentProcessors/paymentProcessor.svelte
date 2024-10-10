<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import { Button } from '$lib/components/ui/button'
	import { formatSats } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'

	import type { PaymentProcessorMap } from './paymentProcessor'
	import LightningPaymentProcessor from './LightningPaymentProcessor.svelte'
	import OnChainPaymentProcessor from './OnChainPaymentProcessor.svelte'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number
	export let paymentType: 'merchant' | string

	const dispatch = createEventDispatcher()
	// TODO: add method validation as we are doing in the paymentDetails input.
	const paymentProcessors: PaymentProcessorMap = {
		ln: {
			component: LightningPaymentProcessor,
			props: {},
		},
		'on-chain': {
			component: OnChainPaymentProcessor,
			props: {},
		},
		// cashu: {
		// 	component: null,
		// 	props: {},
		// },
		// other: {
		// 	component: null,
		// 	props: {},
		// },
	}

	$: currentProcessor = paymentProcessors[paymentDetail.paymentMethod]

	function handlePaymentEvent(event: CustomEvent) {
		dispatch(event.type, event.detail)
	}

	function handleSkipPayment() {
		dispatch('paymentCancelled', { paymentRequest: '', preimage: null, amountSats, paymentType })
	}
</script>

{#if currentProcessor && currentProcessor.component}
	<svelte:component
		this={currentProcessor.component}
		{paymentDetail}
		amountSats={formatSats(amountSats, false)}
		{paymentType}
		{...currentProcessor.props}
		on:paymentComplete={handlePaymentEvent}
		on:paymentExpired={handlePaymentEvent}
		on:paymentCancelled={handlePaymentEvent}
	/>
{:else}
	<div class="flex flex-col">
		<p>Unsupported payment method: {paymentDetail.paymentMethod}</p>
		<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
	</div>
{/if}
