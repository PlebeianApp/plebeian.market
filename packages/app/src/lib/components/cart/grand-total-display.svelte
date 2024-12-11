<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible'
	import { cart } from '$lib/stores/cart'
	import { formatSats } from '$lib/utils'

	export let showActions = false

	let grandTotal: Awaited<ReturnType<typeof cart.calculateGrandTotal>> | null = null

	$: $cart && cart.calculateGrandTotal().then((total) => grandTotal = total)
</script>

<div class="cart-totals mt-4 p-4 bg-gray-100 rounded-lg">
	{#if grandTotal && grandTotal.grandTotalInSats > 0}
		<div class="flex justify-between items-center mb-4">
			<span class="text-xl font-bold">Total:</span>
			<div class="text-right">
				<div class="text-2xl font-bold">
					{formatSats(grandTotal.grandTotalInSats)} sats
				</div>
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
					<div class="flex justify-between mb-2">
						<span>Subtotal:</span>
						{formatSats(grandTotal.grandSubtotalInSats)} sats
					</div>
					<div class="flex justify-between mb-2">
						<span>Shipping:</span>
						{formatSats(grandTotal.grandShippingInSats)} sats
					</div>
					<div class="flex justify-between font-bold text-lg">
						<span>Grand Total:</span>
						{formatSats(grandTotal.grandTotalInSats)} sats
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
