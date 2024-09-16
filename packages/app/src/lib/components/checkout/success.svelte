<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
	import { Separator } from '$lib/components/ui/separator'
	import { cart } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'
	import { formatSats } from '$lib/utils'
	import { CheckCircle } from 'lucide-svelte'

	import Order from '../cart/order.svelte'

	export let variant: 'success' | 'sent' = 'success'
	export let merchant: CartUser | null = null

	$: orders = merchant ? Object.values($cart.orders).filter((order) => order.sellerUserId === merchant.pubkey) : Object.values($cart.orders)

	$: invoices = merchant
		? Object.values($cart.invoices).filter((invoice) => orders.some((order) => order.id === invoice.orderId))
		: Object.values($cart.invoices)
</script>

<div class="flex flex-col items-center justify-center w-full max-w-3xl mx-auto gap-8 py-8">
	<CheckCircle class="w-24 h-24 text-green-500" />

	<Card class="w-full">
		<CardHeader>
			<CardTitle>
				{#if variant === 'success'}
					All your orders have been placed successfully!
				{:else if variant === 'sent'}
					Your order{orders.length > 1 ? 's have' : ' has'} been sent to the merchant{orders.length > 1 ? 's' : ''}!
				{/if}
			</CardTitle>
		</CardHeader>
		{#if orders && invoices}
			<CardContent>
				<Separator class="my-6" />

				<h3 class="text-lg font-semibold mb-4">Orders</h3>
				{#if merchant}
					<Order user={merchant} stalls={$cart.stalls} products={$cart.products} mode="success" />
				{:else}
					{#each Object.values($cart.users) as user (user.pubkey)}
						<Order {user} stalls={$cart.stalls} products={$cart.products} mode="success" />
					{/each}
				{/if}

				<h3 class="text-lg font-semibold mt-6 mb-4">Invoices</h3>
				{#each invoices as invoice (invoice.id)}
					<div class="mb-4 p-4 bg-gray-100 rounded-lg">
						<div class="flex justify-between">
							<span class="font-medium">Invoice ID: {invoice.id}</span>
							<span class="capitalize font-medium {invoice.invoiceStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}">
								{invoice.invoiceStatus}
							</span>
						</div>
						<div class="flex justify-between text-sm text-gray-600 mt-2">
							<span class="font-bold">Amount: {formatSats(invoice.totalAmount)} sats</span>
							<span>Date: {new Date(invoice.createdAt).toLocaleString()}</span>
						</div>
					</div>
				{/each}
			</CardContent>
		{/if}
		<CardFooter>
			<Button class="w-full" on:click={() => (variant === 'sent' ? currentStep.set($currentStep + 1) : null)}>
				Continue <span class="ml-2 i-tdesign-arrow-right"></span>
			</Button>
		</CardFooter>
	</Card>
</div>
