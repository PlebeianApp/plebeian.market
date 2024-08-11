<script lang="ts">
	import type { RichUser } from '$lib/server/users.service'
	import Order from '$lib/components/cart/order.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { cart } from '$lib/stores/cart'
	import { resolveQuery } from '$lib/utils'
	import { derived } from 'svelte/store'

	import MiniUser from '../cart/mini-user.svelte'
	import CheckoutForm from './form.svelte'

	const users = derived<typeof cart, Record<string, RichUser>>(cart, ($cart, set) => {
		Promise.all(Object.keys($cart.users).map(async (id) => [id, await resolveQuery(() => createUserByIdQuery(id))])).then((entries) =>
			set(Object.fromEntries(entries)),
		)
	})
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
	</div>

	<div class="flex flex-col gap-2">
		<h2>Order details</h2>
		<CheckoutForm />
	</div>
</div>
