<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { Button } from '$lib/components/ui/button'

	import type { PageData } from './$types'

	export let data: PageData
	const linkDetails = data.menuItems.find((item) => item.value === 'app-settings')?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class="pb-4 space-y-2">
	<div>WIP</div>
</div>
