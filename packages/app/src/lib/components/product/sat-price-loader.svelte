<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import { createProductPriceQuery } from '$lib/fetch/products.queries'
	import { formatPrice } from '$lib/utils'
  
	export let product: Partial<DisplayProduct>
	$: priceQuery = createProductPriceQuery(product as DisplayProduct)
	export let factor = 1
	$: priceQuery = createProductPriceQuery(product)

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
