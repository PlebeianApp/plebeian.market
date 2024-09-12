<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'
	import { CheckCircle } from 'lucide-svelte'
	import { onMount } from 'svelte'

	export let variant: 'success' | 'sent' = 'success'
	onMount(() => {
		console.log($cart.orders)
	})
</script>

<div class="flex flex-col items-center justify-center h-full gap-8">
	<CheckCircle class="w-24 h-24 mt-8" />
	{#if variant === 'success'}
		<span class="text-xl">All your orders have been placed successfully!</span>
	{:else if variant === 'sent'}
		<span class="text-xl">Your order has been sent to the merchant!</span>
	{/if}

	<Button on:click={() => (variant === 'sent' ? currentStep.set($currentStep + 1) : null)}
		>Continue <span class="ml-2 i-tdesign-arrow-right"></span></Button
	>
</div>
