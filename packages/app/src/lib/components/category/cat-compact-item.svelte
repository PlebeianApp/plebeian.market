<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'

	import Button from '../ui/button/button.svelte'

	export let cat: RichCat
	export let userId: string | null = null
</script>

<Button
	class="cursor-pointer border border-gray flex justify-start items-center p-4 font-bold"
	variant="outline"
	href={userId ? `/cat/${cat.name}/${userId}` : `/cat/${cat.name}`}
>
	<div class="flex items-center gap-2 w-full justify-between">
		<section class=" inline-flex items-center gap-2">
			<span class=" i-mdi-category-outline w-6 h-6" />
			<span>{cat.name}</span>
		</section>
		<span>{cat.productCount}</span>
	</div>
</Button>
