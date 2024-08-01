<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import { createCurrencyConversionQuery } from '$lib/fetch/products.queries'
	import { formatPrice } from '$lib/utils'

	export let product: Partial<DisplayProduct>
	$: priceQuery = createCurrencyConversionQuery(product.currency as string, product.price as number)
	export let factor = 1
</script>

{#if $priceQuery.isLoading}
	<span>Loading...</span>
{:else if $priceQuery.isError}
	<span>Error: {$priceQuery.error.message}</span>
{:else if $priceQuery.data === undefined}
	<span>No data</span>
{:else if $priceQuery.data}
	<span>{formatPrice($priceQuery.data * factor)} sats</span>
{/if}
