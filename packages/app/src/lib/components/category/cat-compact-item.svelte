<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'
	import { page } from '$app/stores'

	import { Badge } from '../ui/badge'

	export let cat: RichCat

	$: currentCat = $page.params.category === cat.name

	const activeCatStyles = 'bg-secondary text-primary'
	const encodedCatName = encodeURIComponent(cat.name)
</script>

<Badge
	variant="primary"
	class={`cursor-pointer flex flex-row justify-center ${currentCat ? activeCatStyles : ''}`}
	href={`/category/${encodedCatName}`}
>
	<span class="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">{cat.name}</span>
</Badge>
