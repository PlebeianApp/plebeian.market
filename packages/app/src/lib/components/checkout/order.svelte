<script lang="ts">
	import type { OrderFilter } from '$lib/schema'
	import type { CartUser } from '$lib/stores/cart'
	import Order from '$lib/components/cart/order.svelte'
	import { Button } from '$lib/components/ui/button'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { checkoutFormStore, currentStep } from '$lib/stores/checkout'
	import ndkStore from '$lib/stores/ndk'
	import { toast } from 'svelte-sonner'

	import { ORDER_STATUS } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	export let merchant: CartUser

	let isLoading = false

	const paymentDetails = createPaymentsForUserQuery(merchant.pubkey)

	async function placeOrder() {
		if (!$checkoutFormStore) return
		const { stalls, pubkey } = $cart.users[merchant.pubkey]

		for (const stallId of stalls) {
			const stall = $cart.stalls[stallId]
			if (!stall.shippingMethodId) {
				toast.error('Make sure you specify the shipping method!')
				throw new Error('Missing shipping method')
			}

			const order: OrderFilter = {
				id: createId(),
				address: $checkoutFormStore.address,
				city: $checkoutFormStore.city,
				contactName: $checkoutFormStore.contactName,
				items: stall.products.map((p) => ({ product_id: p, quantity: $cart.products[p].amount })),
				status: ORDER_STATUS.PENDING,
				shippingId: stall.shippingMethodId,
				stallId: stall.id,
				type: 0,
				buyerUserId: $ndkStore.activeUser!.pubkey,
				sellerUserId: pubkey,
				zip: $checkoutFormStore.zip,
				country: $checkoutFormStore.country,
			}

			cart.updateOrder(order)

			return {
				pubkey,
				order,
			}
		}
	}

	async function handleOrderPlacement() {
		isLoading = true
		try {
			const orderResult = await placeOrder()
			if (orderResult) {
				toast.success('Order placed successfully')
				currentStep.set($currentStep + 2)
			}
		} catch (e) {
			console.error(e)
			toast.error(`Failed to place order: ${e.message}`)
		} finally {
			isLoading = false
		}
	}

	async function handleOrderAndPayment() {
		isLoading = true
		try {
			const orderResult = await placeOrder()
			if (!orderResult) return
			currentStep.set($currentStep + 1)
		} catch (e) {
			console.error(e)
			toast.error('Failed to place order and initiate payment. Please try again.')
		} finally {
			isLoading = false
		}
	}
</script>

<div class="w-1/2 mx-auto flex flex-col gap-4">
	<Order user={merchant} stalls={$cart.stalls} products={$cart.products} mode="cart" on:productUpdate={cart.handleProductUpdate} />
	<div class="flex justify-between gap-4">
		<Button variant="ghost" class="w-full" disabled={isLoading} on:click={handleOrderPlacement}>Order</Button>
		{#if $paymentDetails.data?.length}
			<Button class="w-full" disabled={isLoading} on:click={handleOrderAndPayment}>Order & Pay</Button>
		{/if}
	</div>
</div>
