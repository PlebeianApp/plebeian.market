<script lang="ts">
	import type { NDKEvent, NDKFilter } from '@nostr-dev-kit/ndk'
	import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
	import { NDKRelay, NDKRelaySet, profileFromEvent } from '@nostr-dev-kit/ndk'
	import { Button } from '$lib/components/ui/button'
	import * as Command from '$lib/components/ui/command'
	import CAvatar from '$lib/components/ui/custom-components/c-avatar.svelte'
	import * as Popover from '$lib/components/ui/popover'
	import ndkStore from '$lib/stores/ndk'
	import { isValidNpub } from '$lib/utils/validation.utils'
	import { createEventDispatcher, onDestroy } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import { Input } from '../ui/input'

	const dispatch = createEventDispatcher<{
		select: { npub: string }
	}>()

	export let placeholder: string = 'Search profiles or paste npub...'
	export let commandInput: boolean = false
	let searchQuery = ''
	let searchOpen = false
	let isLoading = false
	let eventList: Array<NDKEvent & { id: string }> = []
	let debounceTimer: ReturnType<typeof setTimeout>
	const DEBOUNCE_MS = 500

	const SEARCH_RELAYS = ['wss://relay.nostr.band', 'wss://search.nos.today', 'wss://nos.lol']

	const searchRelays = new NDKRelaySet(new Set(SEARCH_RELAYS.map((url) => new NDKRelay(url, undefined, $ndkStore))), $ndkStore)

	let searchResults: NDKEventStore<ExtendedBaseType<NDKEvent>> | undefined

	async function handleSearch() {
		if (!searchQuery.trim()) {
			clearSearch()
			return
		}

		try {
			isLoading = true
			searchResults?.unsubscribe()

			const ndkFilter: NDKFilter = {
				kinds: [0],
				search: searchQuery,
				limit: 20,
			}

			searchResults = $ndkStore.storeSubscribe(ndkFilter, {
				closeOnEose: true,
				relaySet: searchRelays,
			})

			if (searchResults) {
				searchResults.onEose(() => {
					isLoading = false
					updateEventList()
				})
			}
		} catch (error) {
			console.error('Search error:', error)
			isLoading = false
			eventList = []
		}
	}

	function updateEventList() {
		if (!$searchResults) {
			clearSearch()
			return
		}

		const searchLower = searchQuery.toLowerCase()
		eventList = Array.from($searchResults).reduce(
			(acc, event) => {
				try {
					const content = JSON.parse(event.content)
					if (!content) return acc

					const name = content.name?.toLowerCase()
					const displayName = content.display_name?.toLowerCase()

					if (name?.includes(searchLower) || displayName?.includes(searchLower)) {
						acc.push(event)
					}

					return acc
				} catch {
					return acc
				}
			},
			[] as Array<NDKEvent & { id: string }>,
		)
	}

	function handleSelect(npub: string) {
		dispatch('select', { npub })
		clearSearch()
	}

	function debouncedSearch() {
		if (!searchQuery.trim()) {
			clearSearch()
			return
		}

		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(handleSearch, DEBOUNCE_MS)
	}

	$: if (searchQuery) {
		debouncedSearch()
	}

	$: if ($searchResults) {
		updateEventList()
	}

	onDestroy(() => {
		cleanup()
	})

	$: if (searchQuery.trim()) {
		if (searchQuery.startsWith('npub')) {
			if (isValidNpub(searchQuery)) {
				handleSelect(searchQuery)
			}
		} else searchOpen = true
	} else {
		searchOpen = false
		eventList = []
	}
	function clearSearch() {
		searchQuery = ''
		eventList = []
		searchOpen = false
	}

	function cleanup() {
		clearTimeout(debounceTimer)
		searchResults?.unsubscribe()
		clearSearch()
	}
</script>

{#if !commandInput}
	<Input type="search" bind:value={searchQuery} {placeholder} />
{/if}
<Popover.Root disableFocusTrap={commandInput ? false : true} openFocus={commandInput ? true : false} bind:open={searchOpen} let:ids>
	{#if commandInput}
		<Popover.Trigger asChild let:builder>
			<Button builders={[builder]} variant="outline" role="combobox" aria-expanded={searchOpen} class="w-full justify-between">
				{placeholder}
				{#if isLoading}
					<Spinner />
				{/if}
			</Button>
		</Popover.Trigger>
	{:else}
		<Popover.Trigger />
	{/if}
	<Popover.Content class=" max-h-[350px] overflow-y-auto p-0">
		<Command.Root>
			{#if commandInput}
				<Command.Input placeholder="Search by name or npub..." bind:value={searchQuery} />
			{/if}
			<Command.List>
				{#if eventList.length === 0}
					<Command.Empty>
						{isLoading || (searchQuery.trim() && isLoading) ? 'Searching...' : 'No profiles found.'}
					</Command.Empty>
				{:else}
					<Command.Group>
						{#each eventList as event (event.id)}
							{@const profile = profileFromEvent(event)}
							<Command.Item value={`${profile?.name || ''}-${event.pubkey}`} onSelect={() => handleSelect(event.author.npub)}>
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
