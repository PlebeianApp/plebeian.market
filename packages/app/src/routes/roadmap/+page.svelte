<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import RoadmapItem from '$lib/components/common/roadmap-item.svelte'
	import { fetchRoadmapData } from '$lib/nostrSubs/utils'

	import type { PageData } from './$types'

	export let data: PageData
	const { appSettings } = data

	let groupedRoadmapEvents: Record<string, NDKEvent[]> = {}

	fetchRoadmapData(appSettings.instancePk).then((events) => {
		events.forEach((event) => {
			const quarterTag = event.tags.find((tag) => tag[0] === 't' && tag[1].startsWith('q'))
			if (quarterTag) {
				const quarter = quarterTag[1]
				if (!groupedRoadmapEvents[quarter]) {
					groupedRoadmapEvents[quarter] = []
				}
				groupedRoadmapEvents[quarter].push(event)
			}
		})

		groupedRoadmapEvents = Object.fromEntries(Object.entries(groupedRoadmapEvents).sort((a, b) => a[0].localeCompare(b[0])))
	})
</script>

<div class="flex min-h-screen w-full flex-col">
	<div class="flex justify-center items-center bg-primary">
		<h2 class="text-secondary my-8">Roadmap</h2>
	</div>
	<main class="flex flex-col items-center gap-16 pb-12 mx-40">
		{#if Object.keys(groupedRoadmapEvents).length === 0}
			<h2 class="my-8 text-center">No items in the roadmap yet...</h2>
		{:else}
			{#each Object.entries(groupedRoadmapEvents) as [quarter, events]}
				<h2 class="my-8 text-center">{quarter.replace('-', ' ')}</h2>
				<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-20 mx-16 w-full">
					{#each events as roadmapEvent}
						<RoadmapItem {roadmapEvent} />
					{/each}
				</div>
			{/each}
		{/if}
	</main>
</div>
