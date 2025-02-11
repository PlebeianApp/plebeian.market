<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import RelayWidget from '$lib/components/assets/relayWidget.svelte'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'

	import type { PageData } from './$types'

	export let data: PageData

	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class="pb-4 space-y-2">
	<div class=" flex items-center gap-1">
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-gray-600">{linkDetails?.description}</p>
		</section>
	</div>

	<Alert.Root class="bg-[var(--neo-blue)]">
		<Alert.Description
			>Your products are published to these relays (servers). You can modify this settings, but you cannot persist them for now. Working on
			it.</Alert.Description
		>
	</Alert.Root>

	<h4 class="text-lg font-bold">Relays</h4>
	<ul class="flex flex-col gap-2">
		<RelayWidget mode={'settings'} />
	</ul>
</div>
