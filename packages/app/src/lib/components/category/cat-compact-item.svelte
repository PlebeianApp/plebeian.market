<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'

	import { Badge } from '../ui/badge'
	import Button from '../ui/button/button.svelte'

	export let cat: RichCat
	export let userId: string | null = null
	function getCategoryUrl() {
		const encodedCatName = encodeURIComponent(cat.name)
		return userId ? `/category/${encodedCatName}/${userId}` : `/category/${encodedCatName}`
	}
</script>

<Badge
	variant="outline"
	class="cursor-pointer bg-white hover:shadow-md rounded-none hover:border-primary border border-black duration-200 flex flex-row justify-between"
	href={getCategoryUrl()}
>
	<section class="inline-flex items-center gap-2 min-w-0 flex-1">
		<span class="i-mdi-category-outline w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
		<span class="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">{cat.name}</span>
	</section>
	<span class="flex-shrink-0">{cat.productCount}</span>
</Badge>
