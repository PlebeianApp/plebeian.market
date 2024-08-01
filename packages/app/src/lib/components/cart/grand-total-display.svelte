<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible'
	import { cart } from '$lib/stores/cart'
	import { debounce } from '$lib/utils'

	export let showActions = false

	let grandTotal: Awaited<ReturnType<typeof cart.calculateGrandTotal>> | null = null

	$: updateGrandTotal($cart)

	const updateGrandTotal = debounce(async () => {
		grandTotal = await cart.calculateGrandTotal()
	}, 300)
</script>

<div class="cart-totals mt-4 p-4 bg-gray-100 rounded-lg">
	{#if grandTotal && grandTotal.grandTotalInSats > 0}
		<div class="flex justify-between items-center mb-4">
			<span class="text-xl font-bold">Total:</span>
			<div class="text-right">
				<div class="text-2xl font-bold">{grandTotal.grandTotalInSats.toLocaleString()} sats</div>
			</div>
		</div>

		<Collapsible>
			<CollapsibleTrigger asChild let:builder>
				<Button variant="ghost" class="w-full justify-between" builders={[builder]}>
					<span>View Details</span>
					<span class="i-mdi-chevron-down"></span>
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div class="mt-4 space-y-2">
					{#each Object.entries(grandTotal.currencyTotals) as [currency, amounts]}
						<div class="flex justify-between">
							<span>{currency} Total:</span>
							<span>
								{(amounts.total + amounts.shipping).toLocaleString(undefined, { style: 'currency', currency })}
							</span>
						</div>
					{/each}
					<div class="flex justify-between mb-2">
						<span>Subtotal:</span>
						<span>{grandTotal.grandSubtotalInSats.toLocaleString()} sats</span>
					</div>
					<div class="flex justify-between mb-2">
						<span>Shipping:</span>
						<span>{grandTotal.grandShippingInSats.toLocaleString()} sats</span>
					</div>
					<div class="flex justify-between font-bold text-lg">
						<span>Grand Total:</span>
						<span>{grandTotal.grandTotalInSats.toLocaleString()} sats</span>
					</div>
				</div>
			</CollapsibleContent>
		</Collapsible>

		{#if showActions}
			<div class="mt-4">
				<slot name="actions"></slot>
			</div>
		{/if}
	{:else}
		<p>Your cart is empty.</p>
	{/if}
</div>
