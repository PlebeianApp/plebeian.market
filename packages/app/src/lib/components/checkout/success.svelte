<script lang="ts">
	import type { CartUser, NormalizedCart } from '$lib/stores/cart'
	import { goto } from '$app/navigation'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
	import { Separator } from '$lib/components/ui/separator'
	import { persistOrdersAndInvoicesMutation } from '$lib/fetch/checkout.mutations'
	import { cart } from '$lib/stores/cart'
	import { checkIfUserExists, shouldRegister } from '$lib/utils'
	import { CheckCircle, XCircle } from 'lucide-svelte'
	import { createEventDispatcher, onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Order from '../cart/order.svelte'
	import InvoiceDisplay from '../common/invoice-display.svelte'

	export let variant: 'singleMerchant' | 'multiMerchant'
	export let merchant: CartUser | null = null
	const dispatch = createEventDispatcher()
	$: orders = merchant ? Object.values($cart.orders).filter((order) => order.sellerUserId === merchant.pubkey) : Object.values($cart.orders)

	$: invoices = merchant
		? Object.values($cart.invoices).filter((invoice) => orders.some((order) => order.id === invoice.orderId))
		: Object.values($cart.invoices)

	$: sortedInvoices = invoices.sort((a, b) => {
		if (a.type === 'merchant' && b.type !== 'merchant') return -1
		if (a.type !== 'merchant' && b.type === 'merchant') return 1
		return 0
	})

	let isPersisting = true
	let error: string | null = null
	let persistenceComplete: boolean | null = null

	async function handlePersist() {
		if (persistenceComplete) return true
		isPersisting = true
		error = null

		try {
			let filteredCartData: NormalizedCart = {
				users: {},
				stalls: {},
				products: {},
				orders: {},
				invoices: {},
			}

			if (merchant) {
				filteredCartData.users = { [merchant.pubkey]: $cart.users[merchant.pubkey] }

				merchant.stalls.forEach((stallId) => {
					filteredCartData.stalls[stallId] = $cart.stalls[stallId]

					$cart.stalls[stallId].products.forEach((productId) => {
						filteredCartData.products[productId] = $cart.products[productId]
					})
				})

				Object.entries($cart.orders).forEach(([orderId, order]) => {
					if (order.sellerUserId === merchant.pubkey) {
						filteredCartData.orders[orderId] = order

						Object.entries($cart.invoices).forEach(([invoiceId, invoice]) => {
							if (invoice.orderId === orderId) {
								filteredCartData.invoices[invoiceId] = invoice
							}
						})
					}
				})
			} else {
				filteredCartData = {
					users: $cart.users,
					stalls: $cart.stalls,
					products: $cart.products,
					orders: $cart.orders,
					invoices: $cart.invoices,
				}
			}

			const result = await $persistOrdersAndInvoicesMutation.mutateAsync(filteredCartData)
			persistenceComplete = result.success
			return result.success
		} catch (err) {
			console.error('Error:', err)
			error = err instanceof Error ? err.message : 'An unexpected error occurred'
			return false
		} finally {
			isPersisting = false
		}
	}

	function handleContinue() {
		if (variant === 'multiMerchant') {
			dispatch('validate', { valid: true })
		} else {
			goto('/')
			dispatch('checkoutComplete', true)
		}
	}

	onMount(async () => {
		if (!merchant) return

		const userExists = await checkIfUserExists(merchant.pubkey)
		const shouldPersist = await shouldRegister(undefined, userExists)
		if (shouldPersist && !persistenceComplete) {
			await handlePersist()
		} else {
			isPersisting = false
		}
	})
</script>

<div class="flex flex-col items-center justify-center w-full max-w-3xl mx-auto gap-8 py-8">
	{#if isPersisting}
		<Spinner size={95} />
		<p class="text-lg text-center">Processing your order...</p>
	{:else if error}
		<XCircle class="w-24 h-24 text-red-500" />
		<div class="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
	{:else if persistenceComplete}
		<CheckCircle class="w-24 h-24 text-green-500" />
	{:else}
		<Spinner size={95} />
		<p class="text-lg text-center">Initializing...</p>
	{/if}

	<Card class="w-full">
		<CardHeader>
			<CardTitle class="text-2xl text-center text-green-700">
				{#if error}
					An error occurred
				{:else if persistenceComplete}
					{#if variant === 'singleMerchant'}
						All your orders have been placed successfully!
					{:else if variant === 'multiMerchant'}
						Your order{orders.length > 1 ? 's have' : ' has'} been sent to the merchant{orders.length > 1 ? 's' : ''}!
					{/if}
				{:else}
					Processing your order...
				{/if}
			</CardTitle>
		</CardHeader>
		{#if orders && invoices && persistenceComplete}
			<CardContent>
				<Separator class="my-6" />

				<h3 class="text-xl font-semibold mb-4">Orders</h3>
				{#if merchant}
					<div class="mb-2 text-sm text-gray-600">Order ID: {orders[0].id}</div>
					<Order user={merchant} stalls={$cart.stalls} products={$cart.products} mode="success" />
				{:else}
					{#each Object.values($cart.users) as user (user.pubkey)}
						<Order {user} stalls={$cart.stalls} products={$cart.products} mode="success" />
					{/each}
				{/if}

				{#if sortedInvoices.length}
					<h3 class="text-xl font-semibold mt-8 mb-4">Invoices</h3>
					<div class="space-y-4">
						{#each sortedInvoices as invoice (invoice.id)}
							<InvoiceDisplay {invoice} />
						{/each}
					</div>
				{/if}
			</CardContent>
		{/if}
		<CardFooter>
			<Button
				class="w-full text-lg py-3"
				on:click={handleContinue}
				disabled={isPersisting || persistenceComplete === null || persistenceComplete === false}
			>
				{isPersisting ? 'Processing...' : error ? 'Try Again' : 'Continue'}
			</Button>
		</CardFooter>
	</Card>
</div>
