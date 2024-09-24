<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import Order from '$lib/components/cart/order.svelte'
	import { Button } from '$lib/components/ui/button'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart } from '$lib/stores/cart'
	import { checkoutFormStore } from '$lib/stores/checkout'
	import ndkStore from '$lib/stores/ndk'
	import { formatSats } from '$lib/utils'
	import { createOrderMessage, sendDM } from '$lib/utils/dm.utils'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import { type OrderMessage } from '@plebeian/database/constants'

	import CardContent from '../ui/card/card-content.svelte'
	import CardHeader from '../ui/card/card-header.svelte'
	import CardTitle from '../ui/card/card-title.svelte'
	import Card from '../ui/card/card.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import { FormLabels } from './types'

	const dispatch = createEventDispatcher<{
		validate: { valid: boolean }
		placeOrderOnly: { valid: boolean }
	}>()
	export let merchant: CartUser

	let isLoading = false
	let ableToPlaceOrder = true
	const paymentDetails = createPaymentsForUserQuery(merchant.pubkey)
	let userTotal: Awaited<ReturnType<typeof cart.calculateUserTotal>> | null = null
	$: filledShippingMethods = $cart.users[merchant.pubkey].stalls.every((id) => $cart.stalls[id].shippingMethodId)

	async function placeOrder() {
		if (!$checkoutFormStore) {
			toast.error('Checkout form is not filled')
			return null
		}

		const { stalls, pubkey } = $cart.users[merchant.pubkey]
		const orders: OrderMessage[] = []

		for (const stallId of stalls) {
			try {
				const stall = $cart.stalls[stallId]
				if (!stall.shippingMethodId) {
					throw new Error('Missing shipping method')
				}

				const order: OrderMessage = createOrderMessage($checkoutFormStore, stall, $cart, $ndkStore.activeUser?.pubkey as string, pubkey)
				try {
					cart.addOrder(order)
				} catch (error) {
					console.error('Failed to add order to cart:', error)
					throw new Error('Failed to add order to cart')
				}

				try {
					// await sendDM(order, pubkey)
				} catch (error) {
					console.error('Failed to send order DM:', error)
					throw new Error('Failed to send order DM to merchant')
				}

				orders.push(order)
			} catch (error) {
				console.error(`Error processing order for stall ${stallId}:`, error)
				if (error instanceof Error) {
					toast.error(`Error processing order: ${error.message}`)
				}

				return null
			}
		}

		ableToPlaceOrder = false
		return { pubkey, orders }
	}

	async function handleOrderPlacement() {
		isLoading = true
		try {
			const orderResult = await placeOrder()
			if (orderResult?.orders.length) {
				toast.success('Order placed successfully')
				dispatch('placeOrderOnly', { valid: true })
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
						</div>
					</div>
					<Separator />
				{/if}

				<div
					data-tooltip={!filledShippingMethods ? 'Make sure you choose shipping methods for every stall ' : null}
					class="flex flex-col gap-4"
				>
					{#if $paymentDetails.data?.length}
						<Button class="w-full" disabled={!filledShippingMethods || !ableToPlaceOrder || isLoading} on:click={handleOrderAndPayment}
							>Place Order & Pay</Button
						>
					{/if}
					<Button disabled={!filledShippingMethods} variant="outline" class="w-full" on:click={handleOrderPlacement}>Place Order</Button>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
