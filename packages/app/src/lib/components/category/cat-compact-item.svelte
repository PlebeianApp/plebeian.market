<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'

	import Button from '../ui/button/button.svelte'

	export let cat: RichCat
	export let userId: string | null = null
	function getCategoryUrl() {
		const encodedCatName = encodeURIComponent(cat.name)
		return userId ? `/category/${encodedCatName}/${userId}` : `/category/${encodedCatName}`
	}
</script>

<Button class="cursor-pointer border border-gray flex justify-start items-center p-4 font-bold" variant="outline" href={getCategoryUrl()}>
	<div class="flex items-center gap-2 w-full justify-between text-xs sm:text-base">
		<section class=" inline-flex items-center gap-2">
			<span class=" i-mdi-category-outline w-4 h-4 sm:w-6 sm:h-6" />
			<span>{cat.name}</span>
		</section>
		<span>{cat.productCount}</span>
	</div>
</Button>
