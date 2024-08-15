<script lang="ts">
	import { NDKEvent, NDKRelay, NDKRelayAuthPolicies, normalizeRelayUrl } from '@nostr-dev-kit/ndk'
	import { createUserByIdQuery, createUserRelaysByIdQuery } from '$lib/fetch/users.queries'
	import { activeUserDMs, groupedDMs } from '$lib/nostrSubs/subs'
	import ndkStore from '$lib/stores/ndk'
	import { SendHorizontal } from 'lucide-svelte'
	import { onMount } from 'svelte'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import Textarea from '../ui/textarea/textarea.svelte'
	import ChatBubble from './chat-bubble.svelte'

	export let selectedPubkey: string
	// TODO Incorporate user relays (wip)
	$: messages = $groupedDMs[selectedPubkey] || []
	$: activeUserMessages = $activeUserDMs[selectedPubkey] || []

	let messageMixture: NDKEvent[] = []
	$: {
		messageMixture = [...messages, ...activeUserMessages].sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0))
		scrollToBottom()
	}

	let messagesContainerRef: HTMLDivElement
	let message = ''

	let userProfileQuery = createUserByIdQuery(selectedPubkey)
	let userRelays = createUserRelaysByIdQuery(selectedPubkey)
	const handleSend = async () => {
		if (message.trim()) {
			const recipient = $ndkStore.getUser({ pubkey: selectedPubkey })
			const dm = new NDKEvent($ndkStore)
			dm.kind = 4
			dm.content = (await $ndkStore.signer?.encrypt(recipient, message)) ?? ''
			dm.tags = [['p', recipient.pubkey]]
			await dm.publish()
			message = ''
			document.querySelector<HTMLTextAreaElement>('textarea[name="message"]')?.focus()
		}
	}

	function scrollToBottom() {
		if (messagesContainerRef) {
			messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight
		}
	}

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSend()
		}
	}

	const eventKindActions = new Map([
		[
			3,
			(event: NDKEvent) => {
				console.log('where here', event)
				const parsedContent = JSON.parse(event.content)
				Object.entries(parsedContent)
					.filter(
						([_, permissions]) =>
							(permissions as { read: boolean; write: boolean }).read && (permissions as { read: boolean; write: boolean }).write,
					)
					.map(([url]) => new NDKRelay(normalizeRelayUrl(url), NDKRelayAuthPolicies.signIn(), $ndkStore))
					.forEach((relay) => $ndkStore.pool.addRelay(relay, true))
			},
		],
		[
			10002,
			(event: NDKEvent) => {
				event.tags
					.map((url) => new NDKRelay(normalizeRelayUrl(url[1]), undefined, $ndkStore))
					.forEach((relay) => $ndkStore.outboxPool?.addRelay(relay, true))
			},
		],
		[
			10006,
			(event: NDKEvent) => {
				event.tags.map((url) => url[1]).forEach((relay) => $ndkStore.pool.removeRelay(normalizeRelayUrl(relay)))
			},
		],
		[10007, (event) => console.log('Event kind 10007(Search relays list):', event)],
		[10050, (event) => console.log('Event kind 10050(Relay list to receive DMs):', event)],
	])

	async function setUserRelays(userRelays: NDKEvent[]) {
		for (const event of userRelays) {
			const action = eventKindActions.get(event?.kind as number)
			if (action) {
				action(event)
			} else {
				console.log('Unknown event kind:', event)
			}
		}
	}
	$: {
		if ($userRelays.data) {
			setUserRelays($userRelays.data[3])
		}
	}
	onMount(() => {
		scrollToBottom()
	})
</script>

<div class="flex flex-col h-full max-w-4xl mx-auto">
	<div class="p-4 border-b flex items-center gap-2">
		<CAvatar pubkey={selectedPubkey} profile={$userProfileQuery?.data} />
		<div class="overflow-hidden flex-1">
			<h3 class="text-xl font-semibold truncate">{$userProfileQuery?.data?.displayName}</h3>
		</div>
	</div>

	<div bind:this={messagesContainerRef} class="flex-grow overflow-y-auto p-4 space-y-4">
		{#each messageMixture as message (message.id)}
			<ChatBubble {message} {selectedPubkey} isCurrentUser={message.pubkey !== selectedPubkey} />
		{/each}
	</div>

	<div class="p-4 border-t shrink-0">
		<div class="flex items-center gap-2">
			<Textarea
				bind:value={message}
				on:keydown={handleKeyPress}
				name="message"
				placeholder="Type a message..."
				class="flex-grow resize-none"
				rows={1}
			/>
			{#if message.trim()}
				<button class="p-2 bg-primary text-primary-foreground rounded-full flex-shrink-0" on:click={handleSend}>
					<SendHorizontal size={20} />
				</button>
			{/if}
		</div>
	</div>
</div>
