<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { Button } from '$lib/components/ui/button'

	import type { PageData } from './$types'

	export let data: PageData
	const linkDetails = data.menuItems.find((item) => item.value === 'app-settings')?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class="pb-4 space-y-2">
	<div>
		<div class=" flex items-center gap-1">
			<section>
				<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
				<p class="text-gray-600">{linkDetails?.description}</p>
			</section>
		</div>
	</div>
	<div></div>
</div>
