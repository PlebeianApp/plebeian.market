<script lang="ts">
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { RichUser } from '$lib/server/users.service'
	import { newAmount } from '@nostr-dev-kit/ndk'
	import Order from '$lib/components/cart/order.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { createShippingQuery } from '$lib/fetch/shipping.queries'
	import { createStallQuery } from '$lib/fetch/stalls.queries'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { cart, userCartTotalInSats } from '$lib/stores/cart'
	import { resolveQuery } from '$lib/utils'
	import { Box } from 'lucide-svelte'
	import { derived } from 'svelte/store'

	import Separator from '../ui/separator/separator.svelte'
	import CheckoutForm from './form.svelte'

	const stalls = derived<typeof cart, Record<string, RichStall>>(cart, ($cart, set) => {
		Promise.all(Object.keys($cart.stalls).map(async (id) => [id, await resolveQuery(() => createStallQuery(id))])).then((entries) =>
			set(Object.fromEntries(entries)),
		)
	})
	const users = derived<typeof cart, Record<string, RichUser>>(cart, ($cart, set) => {
		Promise.all(Object.keys($cart.users).map(async (id) => [id, await resolveQuery(() => createUserByIdQuery(id))])).then((entries) =>
			set(Object.fromEntries(entries)),
		)
	})

	const shippings = derived<typeof cart, Record<string, RichShippingInfo[]>>(cart, ($cart, set) => {
		Promise.all(Object.keys($cart.stalls).map(async (id) => [id, await resolveQuery(() => createShippingQuery(id))])).then((entries) =>
			set(Object.fromEntries(entries)),
		)
	})
	$: console.log('methods', $shippings)
</script>

<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2">
	<div class="flex flex-col gap-6">
		{#each Object.values($cart.users) as merchant, i (merchant.pubkey)}
			<Collapsible.Root open={i === 0} class="w-full space-y-2 border-black border-2 p-2">
				<div class="flex items-center justify-between space-x-4 px-4">
					<h4 class="text-sm font-semibold">{$users?.[merchant.pubkey].name}</h4>
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
				<Collapsible.Content class="space-y-2 p-4 flex flex-col gap-6">
					{#each merchant.stalls as stall}
						{@const shippingMethodId = cart.getShippingMethod(merchant.pubkey, stall)}
						{@const shipping = $shippings?.[stall]?.find((shipping) => shipping.id === shippingMethodId)}
						<div class="flex flex-col gap-2">
							<span class="font-semibold">{$stalls?.[stall].name}</span>
							<Separator />
							<ul class="mt-2 text-sm">
								{#each $cart.stalls[stall].products as product}
									<li class="flex justify-between items-center">
										<div class="flex justify-between items-center gap-4">
											<Box />
											<span
												><button
													on:click={() => {
														console.log($cart.stalls[stall])
														const newAmount = $cart.products[product].amount - 1
														const action = newAmount === 0 ? 'remove' : 'decrement'
														cart.handleProductUpdate(
															new CustomEvent(action, {
																detail: {
																	action,
																	userPubkey: merchant.pubkey,
																	stallId: stall,
																	productId: product,
																	amount: $cart.products[product].amount - 1,
																},
															}),
														)
													}}>-</button
												>
												{$cart.products[product].amount}
												<button
													on:click={() =>
														cart.handleProductUpdate(
															new CustomEvent('increment', {
																detail: {
																	action: 'increment',
																	userPubkey: merchant.pubkey,
																	stallId: stall,
																	productId: product,
																	amount: $cart.products[product].amount + 1,
																},
															}),
														)}>+</button
												>

												<span>
													<span>{$cart.products[product].name}</span>
												</span></span
											>
										</div>
										<span>{$cart.products[product].price} {$cart.products[product].currency}</span>
									</li>
								{/each}
							</ul>
							<Separator />
							{#if shipping}
								<span>Shipping: {shipping.name}</span>
							{/if}
						</div>
					{/each}

					{#if $userCartTotalInSats?.[merchant.pubkey]}
						<span class="font-bold text-lg">Total: {$userCartTotalInSats[merchant.pubkey]} sats</span>
					{/if}
				</Collapsible.Content>
			</Collapsible.Root>
		{/each}
	</div>

	<div class="flex flex-col gap-2">
		<h2>Order details</h2>
		<CheckoutForm />
	</div>
</div>
