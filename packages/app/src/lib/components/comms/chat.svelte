<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { SendHorizontal } from 'lucide-svelte'
	import { afterUpdate, onMount } from 'svelte'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import Textarea from '../ui/textarea/textarea.svelte'
	import ChatBubble from './chat-bubble.svelte'

	export let messages: NDKEvent[] = []
	export let activeUserMessages: NDKEvent[] = []
	export let selectedPubkey: string
	$: messageMixture = [...messages, ...activeUserMessages].sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0))
	let messagesContainerRef: HTMLDivElement
	let message = ''

	let userProfileQuery = createUserByIdQuery(selectedPubkey)

	const handleSend = () => {
		if (message.trim()) {
			// TODO: Implement Nostr message sending
			console.log('Sending message:', message)
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

	afterUpdate(() => {
		scrollToBottom()
	})

	onMount(() => {
		scrollToBottom()
	})
</script>

<div class="flex flex-col h-full">
	<div class="p-4 border-b flex items-center">
		<CAvatar pubkey={selectedPubkey} profile={$userProfileQuery?.data} />
		<div class="overflow-hidden">
			<h2 class="font-semibold truncate">{$userProfileQuery?.data?.displayName}</h2>
			{#if $userProfileQuery?.data?.about}
				<p class="text-sm text-muted-foreground break-all">{$userProfileQuery?.data?.about}</p>
			{/if}
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
