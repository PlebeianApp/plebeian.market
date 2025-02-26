<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import * as Card from '$lib/components/ui/card/index'
	import { stringToHexColor } from '$lib/utils'

	import Skeleton from '../ui/skeleton/skeleton.svelte'
	import Hero from './hero.svelte'

	export let roadmapEvent: NDKEvent

	let roadmap: Partial<{
		id: string
		description: string
		image: string
		title: string
		quarter: string
		pubkey: string
	}> = {}

	async function processRoadmapData() {
		if (!roadmapEvent) return

		if ('kind' in roadmapEvent) {
			roadmap = {
				id: roadmapEvent.id,
				description: roadmapEvent.content,
				image: roadmapEvent.tagValue('image'),
				title: roadmapEvent.tagValue('title'),
				quarter: roadmapEvent.tagValue('quarter'),
				pubkey: roadmapEvent.author.pubkey,
			}
		} else {
			roadmap = roadmapEvent
		}
	}
</script>

{#await processRoadmapData()}
	<Card.Root
		class="relative flex flex-col border border-black hover:border-secondary transition-colors hover:shadow-lg duration-200 text-black overflow-hidden min-h-72"
	>
		<a href={`/roadmap/${roadmap.id}`} class="flex flex-col flex-1">
			<Card.Header class="p-0 flex-shrink-0">
				<Skeleton class="w-full aspect-[21/9]" />
			</Card.Header>

			<div class="flex flex-col flex-1 overflow-hidden">
				<Card.Content class="p-2 flex-1 min-h-0">
					<div class="flex items-start justify-between">
						<Skeleton class="h-4 w-full" />
					</div>

					{#if roadmap.description}
						<p class="text-sm font-light line-clamp-3">
							<Skeleton class="h-4 w-full" />
						</p>
					{/if}
				</Card.Content>
			</div>
		</a>
	</Card.Root>
{:then value}
	{#if roadmap.id}
		<Card.Root
			class="w-full flex flex-col border border-black hover:border-secondary transition-colors duration-200 text-black overflow-hidden"
		>
			<a href={`/roadmap/${roadmap.id}`} class="flex flex-col flex-1">
				<Card.Header class="p-2">
					<p class="font-medium text-base line-clamp-2">{roadmap.title}</p>
				</Card.Header>
				<Card.Content class="p-0 flex-1 w-full">
					{#if roadmap.image}
						<div class="relative w-full aspect-[3/2] bg-gray-50">
							<img src={roadmap.image} alt={roadmap.title || 'Shop image'} class="absolute inset-0 w-full h-full object-cover" />
						</div>
					{:else}
						<Hero
							class="relative w-full aspect-[3/2] justify-center"
							gradientColor={stringToHexColor(roadmap.id)}
							gradientOpacity="0.5"
							py="8"
						>
							<div class="flex flex-row gap-2 justify-center z-10">
								<span class="i-mdi-store text-white/90 w-12 h-12 opacity-60" />
							</div>
						</Hero>
					{/if}
				</Card.Content>
			</a>
		</Card.Root>
	{/if}
{/await}
