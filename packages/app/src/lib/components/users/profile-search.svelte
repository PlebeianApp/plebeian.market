<script lang="ts">
	import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk'
	import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
	import { NDKRelay, NDKRelaySet, profileFromEvent } from '@nostr-dev-kit/ndk'
	import { Button } from '$lib/components/ui/button'
	import * as Command from '$lib/components/ui/command'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import * as Popover from '$lib/components/ui/popover'
	import ndkStore from '$lib/stores/ndk'
	import { npubEncode } from 'nostr-tools/nip19'
	import { createEventDispatcher, onDestroy } from 'svelte'

	import Spinner from '../assets/spinner.svelte'

	const dispatch = createEventDispatcher<{
		select: { npub: string }
	}>()

	export let placeholder = 'Search profiles...'

	let searchQuery = ''
	let searchOpen = false
	let isLoading = false
	let eventList: NDKEvent[] = []
	let debounceTimer: ReturnType<typeof setTimeout>

	const searchRelays = new NDKRelaySet(new Set(), $ndkStore)
	searchRelays.addRelay(new NDKRelay('wss://relay.nostr.band', undefined, $ndkStore))
	searchRelays.addRelay(new NDKRelay('wss://search.nos.today', undefined, $ndkStore))
	searchRelays.addRelay(new NDKRelay('wss://nos.lol', undefined, $ndkStore))

	let searchResults: NDKEventStore<ExtendedBaseType<NDKEvent>> | undefined

	async function handleSearch() {
		if (!searchQuery.trim()) {
			console.log('here')
			eventList = []
			return
		}

		isLoading = true
		try {
			if (searchResults) {
				searchResults.unsubscribe()
			}

			const ndkFilter: NDKFilter = {
				kinds: [0],
				search: searchQuery,
				limit: 20,
			}

			searchResults = $ndkStore.storeSubscribe(ndkFilter, { closeOnEose: true, relaySet: searchRelays })

			if (searchResults) {
				searchResults.onEose(() => {
					isLoading = false
					updateEventList()
				})
			}
		} catch (error) {
			console.error('Search error:', error)
			isLoading = false
		}
	}

	function updateEventList() {
		if (!$searchResults) {
			eventList = []
			return
		}

		eventList = Array.from($searchResults).filter((event) => {
			try {
				const content = JSON.parse(event.content)
				return (
					content &&
					(content.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						content.display_name?.toLowerCase().includes(searchQuery.toLowerCase()))
				)
			} catch {
				return false
			}
		})
	}

	function handleSelect(event: NDKEvent) {
		const npub = event.author.npub ?? npubEncode(event.pubkey)
		dispatch('select', { npub })
		searchOpen = false
		searchQuery = ''
		eventList = []
	}

	$: if (searchQuery) {
		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			handleSearch()
		}, 500)
	}

	$: if ($searchResults) {
		updateEventList()
	}

	onDestroy(() => {
		if (searchResults) searchResults.unsubscribe()
		clearTimeout(debounceTimer)
	})
</script>

<Popover.Root bind:open={searchOpen} let:ids>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" role="combobox" aria-expanded={searchOpen} class="w-full justify-between">
			{placeholder}
			{#if isLoading}
				<Spinner />
			{/if}
		</Button>
	</Popover.Trigger>

	<Popover.Content class="w-[300px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search by name or npub..." bind:value={searchQuery} />
			<Command.List>
				{#if eventList.length === 0}
					<Command.Empty>
						{isLoading ? 'Searching...' : 'No profiles found.'}
					</Command.Empty>
				{:else}
					<Command.Group>
						{#each eventList as event (event.id)}
							{@const profile = profileFromEvent(event)}
							<Command.Item value={`${profile?.name || ''}-${event.pubkey}`} onSelect={() => handleSelect(event)}>
								<div class="flex items-center gap-2">
									<CAvatar pubkey={event.pubkey} {profile} />
									<span class="flex flex-col">
										<span class="font-bold">
											{profile?.name || event.author.npub}
										</span>
										{#if profile.nip05}
											<span class="text-xs">
												{profile.nip05}
											</span>
										{/if}
										{#if event.author.npub}
											<span class="text-xs text-muted-foreground">
												{event.author.npub.slice(0, 12)}... {event.author.npub.slice(-6)}
											</span>
										{/if}
									</span>
								</div>
							</Command.Item>
						{/each}
					</Command.Group>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
