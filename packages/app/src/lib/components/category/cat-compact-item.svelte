<script lang="ts">
	import type { RichCat } from '$lib/server/categories.service'

	import { Badge } from '../ui/badge'

	export let cat: RichCat
	export let userId: string | null = null
	function getCategoryUrl() {
		const encodedCatName = encodeURIComponent(cat.name)
		return userId ? `/category/${encodedCatName}/${userId}` : `/category/${encodedCatName}`
	}
</script>

<Badge variant="primary" class="cursor-pointer flex flex-row justify-center" href={getCategoryUrl()}>
	<span class="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">{cat.name}</span>
</Badge>
