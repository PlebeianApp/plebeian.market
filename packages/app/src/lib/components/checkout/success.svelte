<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import { goto } from '$app/navigation'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
	import { Separator } from '$lib/components/ui/separator'
	import { cart } from '$lib/stores/cart'
	import { checkIfUserExists, formatSats, shouldRegister } from '$lib/utils'
	import { CheckCircle } from 'lucide-svelte'
	import { createEventDispatcher, onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Order from '../cart/order.svelte'

	export let variant: 'success' | 'sent' = 'success'
	export let merchant: CartUser | null = null
	const dispatch = createEventDispatcher()
	$: orders = merchant ? Object.values($cart.orders).filter((order) => order.sellerUserId === merchant.pubkey) : Object.values($cart.orders)

	$: invoices = merchant
		? Object.values($cart.invoices).filter((invoice) => orders.some((order) => order.id === invoice.orderId))
		: Object.values($cart.invoices)

	let isPersisting = false
	let error: string | null = null
	let persistenceComplete = false

	async function handlePersist() {
		if (persistenceComplete) return true

		isPersisting = true
		error = null

		try {
			const cartData = JSON.stringify({ orders, invoices })

			const formData = new FormData()
			formData.append('cartData', cartData)

			const response = await fetch('?/persistOrdersAndInvoices', {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()

			if (response.ok) {
				console.log('Orders and invoices persisted successfully')
				persistenceComplete = true
				return true
			} else {
				throw new Error(result.message || 'Failed to persist orders and invoices')
			}
		} catch (err) {
			console.error('Error:', err)
			error = err instanceof Error ? err.message : 'An unexpected error occurred'
			return false
		} finally {
			isPersisting = false
		}
	}

	function handleContinue() {
		if (merchant) {
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
			const result = await handlePersist()
			console.log('Persistence result:', result)
		}
	})
</script>

<div class="flex flex-col items-center justify-center w-full max-w-3xl mx-auto gap-8 py-8">
	{#if isPersisting}
		<Spinner size={95} />
	{:else if error}
		<div class="text-red-500">{error}</div>
	{:else}
		<CheckCircle class="w-24 h-24 text-green-500" />
	{/if}

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
					<span>Order id: {orders[0].id}</span>
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
			<Button class="w-full" on:click={handleContinue} disabled={isPersisting || !persistenceComplete}>
				{isPersisting ? 'Saving...' : 'Continue'}
			</Button>
		</CardFooter>
	</Card>
</div>
