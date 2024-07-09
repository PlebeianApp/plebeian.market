<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import { createProductPriceQuery } from '$lib/fetch/products.queries'

	export let product: Partial<DisplayProduct>
	$: priceQuery = createProductPriceQuery(product as DisplayProduct)
</script>

<span>{$priceQuery.data} sats</span>
