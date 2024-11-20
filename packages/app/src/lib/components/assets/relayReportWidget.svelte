<script lang="ts">
	import { NDKKind } from '@nostr-dev-kit/ndk'
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible'
	import { relayReports } from '$lib/stores/relayReports'
	import { formatDistanceToNow } from 'date-fns'
	import { onDestroy } from 'svelte'

	import Button from '../ui/button/button.svelte'
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte'
	import Separator from '../ui/separator/separator.svelte'

	export let mode: 'widget' | 'settings' = 'widget'
	let isOpen = mode == 'settings'

	let showCount = false
	let timeoutId: ReturnType<typeof setTimeout>

	$: if ($relayReports[0]) {
		showCount = true
		if (timeoutId) clearTimeout(timeoutId)
		timeoutId = setTimeout(() => (showCount = false), 10000)
	}

	onDestroy(() => timeoutId && clearTimeout(timeoutId))

	const getEventKindDisplay = (kind: string) => {
		const kindNumber = Number(kind)
		return NDKKind[kindNumber] || 'Unknown'
	}
</script>

<div class="flex flex-col" class:gap-4={mode === 'settings'}>
	{#if mode === 'widget'}
		<Button
			data-tooltip="View recent relay publications"
			size="icon"
			variant="secondary"
			class="border border-gray hover:border-black transition-colors"
			on:click={() => (isOpen = !isOpen)}
		>
			{#if showCount && $relayReports[0]}
				<div class="text-sm font-semibold">
					{$relayReports[0].relayUrls.length}
				</div>
			{:else}
				<span class="i-mdi-recent w-5 h-5" />
			{/if}
		</Button>
	{/if}

	{#if isOpen}
		<div
			class={`bg-white flex flex-col fixed bottom-0 z-50 gap-2 ${mode == 'widget' && 'w-fit p-2 border-black border-2 rounded-md shadow-lg'}`}
		>
			<Button size="icon" variant="ghost" on:click={() => (isOpen = !isOpen)}>
				<span class="i-mdi-close w-5 h-5" />
			</Button>

			<section class="flex flex-col gap-2">
				<div class="font-semibold text-lg">Recent Publications</div>
				{#if $relayReports.length > 0}
					<ScrollArea class="h-60">
						{#each $relayReports as report (report.timestamp)}
							<Collapsible>
								<CollapsibleTrigger class="w-full hover:bg-gray-50 transition-colors">
									<div class="text-sm py-2 px-1">
										<div class="flex items-center justify-between gap-2">
											<span class="flex items-center gap-1">
												<span class="text-gray-700">Event kind:</span>
												<small class="text-gray-500">({report.eventKind})</small>
												<span class="font-semibold">{getEventKindDisplay(report.eventKind)}</span>
											</span>
											<small class="text-gray-500">({formatDistanceToNow(report.timestamp)} ago)</small>
										</div>
										<div class="text-xs text-gray-600 text-left mt-1">
											Published to <span class="font-semibold">{report.relayUrls.length}</span> relays
										</div>
									</div>
								</CollapsibleTrigger>

								<CollapsibleContent>
									<div class="pl-3 py-2 text-xs space-y-1 bg-gray-50">
										{#each report.relayUrls as url}
											<div class="text-gray-600 hover:text-gray-900">{url}</div>
										{/each}
									</div>
								</CollapsibleContent>
							</Collapsible>
							<Separator class="my-1" />
						{/each}
					</ScrollArea>
				{:else}
					<div class="text-sm text-gray-500 py-4 text-center">No recent publications</div>
				{/if}
			</section>
		</div>
	{/if}
</div>
