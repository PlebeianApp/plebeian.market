<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import { createProductPriceQuery } from '$lib/fetch/products.queries'

	export let product: DisplayProduct
	$: priceQuery = createProductPriceQuery(product)
</script>

<span>{$priceQuery.data} sats</span>
