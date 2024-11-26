<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { normalizeStallData } from '$lib/nostrSubs/utils'
	import { openDrawerForNewProductForStall, openDrawerForStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { resolveQuery, stringToHexColor, truncateString, truncateText } from '$lib/utils'
	import { Edit, MoreVertical, Plus } from 'lucide-svelte'
	import { npubEncode } from 'nostr-tools/nip19'

	import { Button } from '../ui/button'
	import Skeleton from '../ui/skeleton/skeleton.svelte'

	export let stallData: Partial<RichStall> | NDKEvent

	let stall: Partial<RichStall> = {}
	$: isMyStall = $ndkStore.activeUser?.pubkey === stall?.userId

	async function processStallData() {
		if (!stallData) return

		if ('kind' in stallData) {
			const { data: parsedStall, error: parseError } = await normalizeStallData(stallData)
			if (!parsedStall || parseError) return

			const user = $ndkStore.getUser({ pubkey: stallData.author.pubkey })
			const userProfile = await resolveQuery(() => createUserByIdQuery(user.pubkey, true, true))

			stall = {
				...parsedStall,
				userName: userProfile?.name || userProfile?.displayName || '',
				userNip05: userProfile?.nip05,
			}
		} else {
			stall = stallData
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

{#await processStallData()}
	<Card.Root
		class="relative flex flex-col border-2 border-black hover:border-primary transition-colors duration-200 text-black overflow-hidden min-h-96"
	>
		<a href={stallUrl} class="flex flex-col flex-1">
			<Card.Header class="p-0 flex-shrink-0">
				<Skeleton class="h-12 w-full" />
			</Card.Header>

			<div class="flex flex-col flex-1 overflow-hidden">
				<Card.Content class="p-2 flex-1 min-h-0">
					<div class="flex items-start justify-between">
						<Skeleton class="h-4 w-full" />
					</div>

					{#if stall.description}
						<p class="text-sm font-light line-clamp-3">
							<Skeleton class="h-4 w-full" />
						</p>
					{/if}
				</Card.Content>

				<Card.Footer class="mt-auto p-2 border-t border-black/10">
					<div class="grid gap-1 w-full text-sm">
						<div class="flex items-center justify-between">
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-4 w-full" />
						</div>
						{#if stall.userName}
							<div class="flex items-center justify-between">
								<Skeleton class="h-4 w-full" />
								<Skeleton class="h-4 w-full" />
							</div>
						{/if}
						<div class="flex items-center justify-end">
							<Skeleton class="h-4 w-full" />
						</div>
					</div>
				</Card.Footer>
			</div>
		</a>
	</Card.Root>
{:then value}
	{#if stall.id}
		<Card.Root
			class="relative flex flex-col border-2 border-black hover:border-primary transition-colors duration-200 text-black overflow-hidden min-h-96"
		>
			<a href={stallUrl} class="flex flex-col flex-1">
				<Card.Header class="p-0 flex-shrink-0">
					{#if stall.image}
						<div class="relative w-full max-h-56 overflow-hidden">
							<img src={stall.image} alt={stall.name || 'Stall image'} class="object-cover w-full h-full" />
						</div>
					{:else}
						<div style={`background-color: ${stringToHexColor(stall.id)}`} class="h-14 w-full" />
					{/if}
				</Card.Header>

				<div class="flex flex-col flex-1 overflow-hidden">
					<Card.Content class="p-2 flex-1">
						<div class="flex items-start justify-between mb-2">
							<a href={stallUrl} class="flex-1">
								<h3 class=" text-base font-bold line-clamp-2">{stall.name}</h3>
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
							<a href={stallUrl} class="block">
								<p class="line-clamp-3">
									{stall.description}
								</p>
							</a>
						{/if}
					</Card.Content>

					<Card.Footer class="mt-auto p-2 border-t border-black/10">
						<div class="grid gap-1 w-full">
							<div class="flex items-center justify-between">
								<span>Currency:</span>
								<span class=" font-bold">{stall.currency}</span>
							</div>
							{#if stall.userName}
								<div class="flex items-center justify-between">
									<span>Owner:</span>
									<span class=" font-bold">{stall.userName}</span>
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
{/await}
