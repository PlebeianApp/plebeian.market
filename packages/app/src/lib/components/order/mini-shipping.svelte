<script lang="ts">
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import { createShippingMethodQuery } from '$lib/fetch/shipping.queries'

	import { Skeleton } from '../ui/skeleton'

	export let shippingMethodId: string

	let shippingData: RichShippingInfo | undefined

	$: shippingMethodQuery = createShippingMethodQuery(shippingMethodId)
	$: isLoading = $shippingMethodQuery?.isLoading ?? false

	$: {
		if ($shippingMethodQuery?.data) shippingData = $shippingMethodQuery.data[0]
	}
</script>

<div>
	{#if isLoading}
		<Skeleton class="h-4 w-[250px]" />
	{:else if shippingData}
		<div class="py-1 flex flex-row items-center gap-2">
			<span class="i-mdi-truck w-6 h-6" />
			<span class="font-bold">{shippingData.name}</span>
		</div>
	{/if}
</div>
