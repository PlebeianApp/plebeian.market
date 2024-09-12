<script lang="ts">
	import Order from '$lib/components/cart/order.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { cart } from '$lib/stores/cart'
	import { createEventDispatcher } from 'svelte'

	import GrandTotalDisplay from '../cart/grand-total-display.svelte'
	import MiniUser from '../cart/mini-user.svelte'
	import CheckoutForm from './form.svelte'

	const dispatch = createEventDispatcher()

	function handleFormValidation(event: CustomEvent) {
		dispatch('validate', { valid: event.detail.valid })
	}
</script>

<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2">
	<div class="flex flex-col gap-6">
		{#each Object.values($cart.users) as merchant, i (merchant.pubkey)}
			<Collapsible.Root class="w-full space-y-2 border-black border-2 p-2">
				<div class="flex items-center justify-between space-x-4 px-4">
					<MiniUser userId={merchant.pubkey} />
					<Collapsible.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" size="sm" class="w-9 p-0 border-0">
							{#if builder['data-state'] === 'open'}
								<span class="i-tdesign-chevron-up" style="width: 1rem; height: 1rem; color: black;"></span>
							{:else}
								<span class="i-tdesign-chevron-down" style="width: 1rem; height: 1rem; color: black;"></span>
							{/if}
						</Button>
					</Collapsible.Trigger>
				</div>
				<Collapsible.Content class="px-4">
					<Order
						user={merchant}
						stalls={$cart.stalls}
						products={$cart.products}
						mode="checkout"
						on:productUpdate={cart.handleProductUpdate}
					/>
				</Collapsible.Content>
			</Collapsible.Root>
		{/each}
		<GrandTotalDisplay />
	</div>
	<div class="flex flex-col gap-2">
		<h2>Order details</h2>
		<CheckoutForm on:validate={handleFormValidation} />
	</div>
</div>
