<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { normalizeStallData } from '$lib/nostrSubs/utils'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { stringToHexColor, truncateString, truncateText } from '$lib/utils'
	import { Edit, MoreVertical, Plus } from 'lucide-svelte'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'

	import { Button } from '../ui/button'

	export let stallData: Partial<RichStall> | NDKEvent
	let stall: Partial<RichStall> = {}
	let processing = false

	$: isMyStall = $ndkStore.activeUser?.pubkey === stall?.userId

	$: if (stallData && !processing) {
		processing = true

		if ('kind' in stallData) {
			normalizeStallData(stallData).then(async ({ data: parsedStall, error: parseError }) => {
				if (!parsedStall || parseError) {
					processing = false
					return
				}

				const user = $ndkStore.getUser({ pubkey: stallData.author.pubkey })
				const userProfile = await user.fetchProfile()

				stall = {
					...parsedStall,
					userName: userProfile?.name || userProfile?.displayName || '',
					userNip05: userProfile?.nip05,
				}
				processing = false
			})
		} else {
			stall = stallData
			processing = false
		}
	}
	$: stallUrl = stall.userNip05
		? `/stalls/${stall.userNip05.toLowerCase()}/${stall.identifier}`
		: `/stalls/${stall.id?.replace(/^30017:/, '')}`

	function handleStallAction(action: 'edit' | 'add') {
		if (!stall.id) return

		if (action === 'edit') {
			openDrawerForStall(String(stall.id))
		} else {
			openDrawerForNewProductForStall(String(stall.id))
		}
	}
</script>

{#if stall.id}
	<Card.Root
		class="relative flex flex-col h-[44vh] border-2 border-black hover:border-primary transition-colors duration-200 text-black overflow-hidden group"
	>
		<a href={stallUrl} class="flex flex-col flex-1">
			<Card.Header class="p-0 flex-shrink-0">
				{#if stall.image}
					<img src={stall.image} alt="" class="object-cover w-full h-[25vh]" />
				{:else}
					<div style={`background-color: ${stringToHexColor(stall.id)}`} class="h-[5vh]" />
				{/if}
			</Card.Header>

			<div class="flex flex-col flex-1 overflow-hidden">
				<Card.Content class="p-2 flex-1 min-h-0">
					<div class="flex items-start justify-between">
						<a href={stallUrl} class="flex-1">
							<h3 class="text-xl font-bold line-clamp-1">{stall.name}</h3>
						</a>
						{#if isMyStall && stall.id}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild let:builder>
									<Button builders={[builder]} variant="ghost" size="icon" class="h-8 w-8 p-0 hover:bg-black/5 -mr-1">
										<MoreVertical class="h-5 w-5" />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end" class="min-w-[8rem]">
									<DropdownMenu.Item class="cursor-pointer" on:click={() => handleStallAction('edit')}>
										<Edit class="mr-2 h-4 w-4" />
										<span>Edit stall</span>
									</DropdownMenu.Item>
									<DropdownMenu.Item class="cursor-pointer" on:click={() => handleStallAction('add')}>
										<Plus class="mr-2 h-4 w-4" />
										<span>Add product</span>
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
					</div>

					{#if stall.description}
						<a href={stallUrl} class="block mt-1">
							<p class="text-sm font-light line-clamp-3">
								{stall.description}
							</p>
						</a>
					{/if}
				</Card.Content>

				<Card.Footer class="mt-auto p-2 border-t border-black/10">
					<div class="grid gap-1 w-full text-sm">
						<div class="flex items-center justify-between">
							<span class="font-medium">Currency:</span>
							<span>{stall.currency}</span>
						</div>
						{#if stall.userName}
							<div class="flex items-center justify-between">
								<span class="font-medium">Owner:</span>
								<span>{stall.userName}</span>
							</div>
						{/if}
						<div class="flex items-center justify-end">
							<small class="font-light text-black/70">
								{stall.userNip05 ? truncateText(stall.userNip05, 21) : `@${truncateString(npubEncode(stall.userId))}`}
							</small>
						</div>
					</div>
				</Card.Footer>
			</div>
		</a>
	</Card.Root>
{/if}
