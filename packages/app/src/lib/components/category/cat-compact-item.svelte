<script lang="ts">
	import { goto } from '$app/navigation'

	import type { Category } from '@plebeian/database'

	import Button from '../ui/button/button.svelte'

	export let cat: Category
</script>

<Button
	class="cursor-pointer border border-gray flex justify-start items-center p-4 font-bold"
	variant="outline"
	on:click={() => {
		goto(`/cat/${cat.id}`)
	}}
>
	<div class="flex items-center gap-2">
		<span class=" i-mdi-category-outline w-6 h-6" />
		<span>{cat.name}</span>
	</div>
</Button>
