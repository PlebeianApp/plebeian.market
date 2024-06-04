<script lang="ts">
	import { page } from '$app/stores'
	import DeleteAccount from '$lib/components/settings/delete-account.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class=" flex items-center gap-1">
	<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
		<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
	</Button>
	<section>
		<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
		<p class="text-gray-600">{linkDetails?.description}</p>
	</section>
</div>
<DeleteAccount intentToDelete={true} />
