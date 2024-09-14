<script lang="ts">
	import type { OrderFilter } from '$lib/schema'
	import type { CartUser } from '$lib/stores/cart'
	import Order from '$lib/components/cart/order.svelte'
	import { Button } from '$lib/components/ui/button'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { platformV4VForUserQuery } from '$lib/fetch/v4v.queries'
	import { cart } from '$lib/stores/cart'
	import { checkoutFormStore, currentStep } from '$lib/stores/checkout'
	import ndkStore from '$lib/stores/ndk'
	import { formatSats } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import { ORDER_STATUS } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import CardContent from '../ui/card/card-content.svelte'
	import CardHeader from '../ui/card/card-header.svelte'
	import CardTitle from '../ui/card/card-title.svelte'
	import Card from '../ui/card/card.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import { FormLabels } from './types'

	const dispatch = createEventDispatcher()
	export let merchant: CartUser

	let isLoading = false
	let ableToPlaceOrder = true
	const paymentDetails = createPaymentsForUserQuery(merchant.pubkey)
	const merchantV4vPlatformShares = platformV4VForUserQuery('platform', merchant.pubkey)
	let userTotal: Awaited<ReturnType<typeof cart.calculateUserTotal>> | null = null

	async function placeOrder() {
		if (!$checkoutFormStore) return null

		const { stalls, pubkey } = $cart.users[merchant.pubkey]
		const orders: OrderFilter[] = []

		for (const stallId of stalls) {
			const stall = $cart.stalls[stallId]
			if (!stall.shippingMethodId) {
				// toast.error(`Make sure you specify the shipping method for stall ${stallId}!`)
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

			cart.addOrder(order)
			orders.push(order)
		}
		ableToPlaceOrder = false
		return { pubkey, orders }
	}

	async function handleOrderPlacement() {
		isLoading = true
		try {
			const orderResult = await placeOrder()
			if (orderResult?.orders.length) {
				console.log($cart.orders)
				toast.success('Order placed successfully')
				dispatch('validate', { valid: true })
				dispatch('validate', { valid: true })
			}
		} catch (e) {
			console.error(e)
			e instanceof Error && toast.error(`Failed to place order: ${e.message}`)
		} finally {
			isLoading = false
		}
	}

	async function handleOrderAndPayment() {
		isLoading = true
		try {
			const orderResult = await placeOrder()
			if (!orderResult) return
			dispatch('validate', { valid: true })
		} catch (e) {
			console.error(e)
			e instanceof Error && toast.error(`Failed to place order: ${e.message}`)
		} finally {
			isLoading = false
		}
	}
</script>

<div class="flex flex-col md:flex-row gap-8">
	<Card class="flex-1">
		<CardHeader>
			<CardTitle>Order Details</CardTitle>
		</CardHeader>
		<CardContent>
			<Order
				user={merchant}
				stalls={$cart.stalls}
				products={$cart.products}
				mode="cart"
				on:productUpdate={cart.handleProductUpdate}
				bind:userTotal
			/>
		</CardContent>
	</Card>

	<Card class="flex-1">
		<CardHeader>
			<CardTitle>Order Details Summary</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-6">
				{#if $checkoutFormStore}
					<div>
						{#each Object.entries($checkoutFormStore) as [key, value]}
							{#if value}
								<div class="grid grid-cols-[auto_1fr] gap-2 text-sm">
									<span class="text-muted-foreground">{FormLabels[key]}:</span>
									<span>{value}</span>
								</div>
							{/if}
						{/each}
					</div>
				{/if}

				<Separator />

				{#if userTotal}
					<div>
						<h3 class="font-semibold mb-3">Order Total</h3>
						<div class="space-y-2">
							{#each Object.entries(userTotal.currencyTotals) as [currency, amounts]}
								<div class="flex justify-between items-center">
									<span class="text-muted-foreground">{currency} Total:</span>
									<span class="text-xl">
										{(amounts.total + amounts.shipping).toLocaleString()}
										{currency}
									</span>
								</div>
							{/each}
							<div class="flex justify-between items-center pt-2">
								<span class="text-muted-foreground font-semibold">Total in Sats:</span>
								<span class="text-2xl font-bold">
									{formatSats(userTotal.totalInSats)} sats
								</span>
							</div>
							<!-- <div class="flex justify-between items-center">
							<span class="text-muted-foreground">Shipping</span> 
							<span class="text-sm">{userTotal.shippingInSats.toLocaleString(undefined, {
								maximumFractionDigits: 0,
							})} sats</span>
						</div> -->
						</div>
					</div>
				{/if}

				<Separator />

				<div class="flex flex-col gap-4">
					<Button variant="outline" class="w-full" disabled={!ableToPlaceOrder || isLoading} on:click={handleOrderPlacement}>
						Place Order
					</Button>
					{#if $paymentDetails.data?.length}
						<Button class="w-full" disabled={!ableToPlaceOrder || isLoading} on:click={handleOrderAndPayment}>Place Order & Pay</Button>
					{/if}
				</div>
			</div>
		</CardContent>
	</Card>
</div>
