<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'
	import { goto } from '$app/navigation'

	import Button from '../ui/button/button.svelte'

	export let cat: RichCat
</script>

<Button
	class="cursor-pointer border border-gray flex justify-start items-center p-4 font-bold"
	variant="outline"
	on:click={() => {
		goto(`/cat/n/${cat.name}`)
	}}
>
	<div class="flex items-center gap-2">
		<span class=" i-mdi-category-outline w-6 h-6" />
		<span>{cat.name}</span>
		<span>{cat.productCount}</span>
	</div>
</Button>
