<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import Order from '$lib/components/cart/order.svelte'
	import { createOrderMutation } from '$lib/fetch/orders.mutations'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'
	import ndkStore from '$lib/stores/ndk'
	import { get } from 'svelte/store'

	import Button from '../ui/button/button.svelte'

	export let merchant: CartUser

	$: paymentDetails = createPaymentsForUserQuery(merchant.pubkey)

	async function placeOrder() {
		const $ndkStore = get(ndkStore)
		await $createOrderMutation.mutate({
			address: '',
			city: '',
			contactName: '',
			items: [],
			shippingId: '',
			stallId: '',
			type: 0,
			buyerUserId: $ndkStore.activeUser!.pubkey,
			sellerUserId: merchant.pubkey,
		})
	}
</script>

<div class="w-1/2 mx-auto flex flex-col gap-4">
	<Order user={merchant} stalls={$cart.stalls} products={$cart.products} mode="cart" on:productUpdate={cart.handleProductUpdate} />
	<div class="flex justify-between gap-4">
		<Button
			variant="ghost"
			class="w-full"
			on:click={() => {
				currentStep.set($paymentDetails.data?.length ? $currentStep + 2 : $currentStep + 1)
			}}>Order</Button
		>
		{#if $paymentDetails.data?.length}
			<Button
				class="w-full"
				on:click={() => {
					currentStep.set($currentStep + 1)
				}}>Order & Pay</Button
			>
		{/if}
	</div>
</div>
