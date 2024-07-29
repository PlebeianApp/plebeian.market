<script lang="ts">
	import { KindStalls } from '$lib/constants'
	import {
		allStallsHaveShippingMethod,
		cart,
		clearCart,
		decrementProduct,
		getTotalAmounts,
		incrementProduct,
		removeProduct,
		setAmountForProduct,
		updatePrices,
	} from '$lib/stores/cart'

	import Button from '../ui/button/button.svelte'
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MiniStall from './mini-stall.svelte'
	import MiniUser from './mini-user.svelte'
	import ProductInCart from './product-in-cart.svelte'

	$: ({ totalAmountItems, totalInSats, totalShippingCost } = $getTotalAmounts)
	// TODO improve stores reactivity
	const handleIncrement = (productId: string) => {
		incrementProduct(productId)
	}

	const handleDecrement = (productId: string) => {
		decrementProduct(productId)
	}

	const handleSetAmount = (e: Event, productId: string) => {
		setAmountForProduct(productId, e.target.value)
	}

	const handleRemove = (productId: string) => {
		removeProduct(productId)
	}

	const handleCheckout = () => {
		$cart.map((user) => {
			console.log('Stall orders for user:', user.pubkey)
			user.stalls.map((stall) => {
				console.log('Orders for stall:', stall.id)
				stall.products.map((product) => {
					console.log('Product:', product.id, 'Amount:', product.amount)
				})
			})
		})
	}
</script>

<div class="flex flex-col justify-between w-full h-full">
	{#if $cart.length === 0}
		<p>Your cart is empty</p>
	{:else}
		<ScrollArea class="flex-grow max-h-[75vh]">
			{#each $cart as user}
				<div class="flex flex-col w-full">
					<MiniUser userId={user.pubkey} />
					{#each user.stalls as stall}
						<div class="flex flex-col w-full">
							<MiniStall stallId={stall.id.split(':').length !== 3 ? `${KindStalls}:${user.pubkey}:${stall.id}` : stall.id} />
							{#each stall.products as product}
								<div class="flex flex-col w-full">
									<ProductInCart
										productId={product.id}
										on:increment={() => handleIncrement(product.id)}
										on:decrement={() => handleDecrement(product.id)}
										on:setAmount={(e) => handleSetAmount(e, product.id)}
										on:remove={() => handleRemove(product.id)}
									/>
									<Separator class="mb-3" />
								</div>
							{/each}
						</div>
					{/each}
				</div>
			{/each}
		</ScrollArea>
		<div class="flex flex-col mt-4 gap-2">
			<div class="flex flex-col gap-2">
				<div class="flex flex-row justify-between">
					<h3>Subtotal</h3>
					<div>
						{(totalInSats - totalShippingCost).toLocaleString('en-US', {
							maximumFractionDigits: 2,
						})} sats
					</div>
				</div>
				<div class="flex flex-row justify-between">
					<div>{totalAmountItems} items</div>
					<div>
						{totalShippingCost.toLocaleString('en-US', {
							maximumFractionDigits: 2,
						})} sats (shipping)
					</div>
				</div>
				<div class="flex flex-row justify-between font-bold">
					<div>Total:</div>
					<u
						>{totalInSats.toLocaleString('en-US', {
							maximumFractionDigits: 2,
						})} sats</u
					>
				</div>
			</div>
			<div class="flex flex-row items-center gap-2">
				<Button class="grow" disabled={!$allStallsHaveShippingMethod} on:click={handleCheckout}>Checkout</Button>
				<Button class="w-20" variant="destructive" on:click={clearCart}><span class=" i-mdi-trash-can" /></Button>
				<Button variant="secondary" on:click={updatePrices} size="icon"><span class="i-mdi-update"></span></Button>
			</div>
		</div>
	{/if}
</div>
