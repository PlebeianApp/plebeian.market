<script lang="ts">
	import { page } from '$app/stores'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import ndkStore, { defaulRelaysUrls } from '$lib/stores/ndk'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData

	$: relayUrls = [...new Set([...($ndkStore.activeUser?.relayUrls ?? []), ...defaulRelaysUrls])].map((u) => new URL(u))
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class="pb-4 space-y-2">
	<div class=" flex items-center gap-1">
		<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</Button>
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-gray-600">{linkDetails?.description}</p>
		</section>
	</div>

	<Alert.Root class="bg-[var(--neo-blue)]">
		<Alert.Description
			>Your products are published to these relays (servers). You cannot modify this setting for now. Please let us know if you’d like to
			add a relay.</Alert.Description
		>
	</Alert.Root>

	<h4 class="text-lg font-bold">Relays</h4>
	<ul class="flex flex-col gap-2">
		{#each relayUrls as url}
			<li class="flex flex-col">
				<a href={url.href} class="font-bold text-md">{url.hostname}</a>
				<code class="text-sm">{url.href}</code>
			</li>
		{/each}
	</ul>
</div>
