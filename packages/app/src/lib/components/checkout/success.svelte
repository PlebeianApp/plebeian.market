<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import { goto } from '$app/navigation'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
	import { Separator } from '$lib/components/ui/separator'
	import { queryClient } from '$lib/fetch/client'
	import { cart } from '$lib/stores/cart'
	import ndkStore from '$lib/stores/ndk'
	import { checkIfUserExists, formatSats, shouldRegister } from '$lib/utils'
	import { CheckCircle } from 'lucide-svelte'
	import { createEventDispatcher, onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Order from '../cart/order.svelte'
	import InvoiceDeisplay from '../common/invoice-deisplay.svelte'

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

	let isPersisting = false
	let error: string | null = null
	let persistenceComplete: boolean | null = null

	async function handlePersist() {
		if (persistenceComplete) return true

		isPersisting = true
		error = null

		try {
			const cartData = JSON.stringify({ orders, invoices })
			const formData = new FormData()
			formData.append('cartData', cartData)
			// FIXME: Error when attempting to persist orders and invoices in vps deployment. Error: SyntaxError: Unexpected token 'C', "Cross-site"... is not valid JSON
			const response = await fetch('?/persistOrdersAndInvoices', {
				method: 'POST',
				body: formData,
			})

			const result = await response.json()

			if (response.ok) {
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
			// TODO: reduce product stock Quantity of products when order is fully paid, when an order has just been placed or not fully paid no
			await handlePersist()
		}
	})
</script>

<div class="flex flex-col items-center justify-center w-full max-w-3xl mx-auto gap-8 py-8">
	{#if isPersisting}
		<Spinner size={95} />
	{:else if error}
		<div class="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
	{:else}
		<CheckCircle class="w-24 h-24 text-green-500" />
	{/if}

	<Card class="w-full">
		<CardHeader>
			<CardTitle class="text-2xl text-center text-green-700">
				{#if error}
					...
				{:else if variant === 'singleMerchant'}
					All your orders have been placed successfully!
				{:else if variant === 'multiMerchant'}
					Your order{orders.length > 1 ? 's have' : ' has'} been sent to the merchant{orders.length > 1 ? 's' : ''}!
				{/if}
			</CardTitle>
		</CardHeader>
		{#if orders && invoices}
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
							<InvoiceDeisplay {invoice} />
						{/each}
					</div>
				{/if}
			</CardContent>
		{/if}
		<CardFooter>
			<Button
				class="w-full text-lg py-3"
				on:click={handleContinue}
				disabled={isPersisting || (persistenceComplete != null && !persistenceComplete)}
			>
				{isPersisting ? 'Saving...' : 'Continue'}
			</Button>
		</CardFooter>
	</Card>
</div>
