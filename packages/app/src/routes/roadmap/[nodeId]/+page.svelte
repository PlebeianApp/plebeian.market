<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte'
	import { fetchRoadmapEvent } from '$lib/nostrSubs/utils'
	import { handleBack } from '$lib/utils'
	import { sanitizeAndParseContent } from '$lib/utils/ui.utils'
	import { ArrowLeft } from 'lucide-svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { roadmap } = data

	let roadmapItem: {
		id: string
		content: string
		image: string
		title: string
		quarter: string
		pubkey: string
	} | null = null

	fetchRoadmapEvent(roadmap.id).then((event) => {
		if (!event) return
		roadmapItem = {
			id: event.id,
			content: event.content,
			image: event.tagValue('image') || '',
			title: event.tagValue('title') || '',
			quarter: event.tagValue('quarter') || '',
			pubkey: event.author.pubkey,
		}
	})
</script>

{#if roadmapItem}
	<div class="relative">
		<Button variant="ghost" class="absolute top-4 left-4 z-10 flex items-center gap-2 text-white" on:click={handleBack}>
			<ArrowLeft class="w-4 h-4" />
			<span>Back</span>
		</Button>
		<div
			class="absolute inset-x-0 -bottom-30 h-full bg-[radial-gradient(ellipse_at_bottom,var(--secondary)_25%,transparent_70%)] opacity-30 blur-2xl z-0"
		/>
		{#if roadmapItem.image}
			<div class="container relative z-1 min-h-[600px] pt-8 pb-16 px-4 sm:px-8">
				<img src={roadmapItem.image} alt={roadmapItem.title} class="w-full h-full object-cover" />
			</div>
		{:else}
			<div class="container relative z-1 min-h-[600px] pt-8 pb-16 px-4 sm:px-8">
				<div class="w-full h-full bg-gray-500"></div>
			</div>
		{/if}

		<div class="container relative z-1 min-h-[600px] pt-8 pb-16 px-4 sm:px-8">
			<div class="flex flex-col gap-4">
				<h1 class="text-4xl font-bold">{roadmapItem.title}</h1>
				{#if roadmapItem.content}
					{#await sanitizeAndParseContent(roadmapItem.content)}
						<p>Loading...</p>
					{:then content}
						{@html content}
					{:catch error}
						<p>Error: {error.message}</p>
					{/await}
				{/if}
			</div>
		</div>
	</div>
{/if}
