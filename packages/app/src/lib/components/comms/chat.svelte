<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import ndkStore from '$lib/stores/ndk'
	import { SendHorizontal } from 'lucide-svelte'
	import { afterUpdate, onMount } from 'svelte'

	import AvatarFallback from '../ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '../ui/avatar/avatar-image.svelte'
	import Avatar from '../ui/avatar/avatar.svelte'
	import Textarea from '../ui/textarea/textarea.svelte'

	export let messages: NDKEvent[] = []
	export let selectedPubkey: string

	let messagesContainerRef: HTMLDivElement
	let message = ''
	$: userProfileQuery = createUserByIdQuery(selectedPubkey)

	onMount(() => {
		scrollToBottom()
	})

	afterUpdate(() => {
		scrollToBottom()
	})

	function scrollToBottom() {
		if (messagesContainerRef) {
			messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight
		}
	}

	function handleInputChange(event: Event) {
		message = (event.target as HTMLTextAreaElement).value
	}

	function handleSend() {
		if (message.trim()) {
			// TODO: Implement Nostr message sending
			console.log('Sending message:', message)
			message = ''
			;(document.querySelector('textarea[name="message"]') as HTMLTextAreaElement).focus()
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSend()
		}

		if (event.key === 'Enter' && event.shiftKey) {
			event.preventDefault()
			message += '\n'
		}
	}

	function shortenPubkey(pubkey: string) {
		return pubkey.slice(0, 6) + '...' + pubkey.slice(-4)
	}
</script>

<div class="flex flex-col h-full">
	<div class="p-4 border-b flex items-center shrink-0">
		<Avatar class="h-10 w-10 mr-3 flex-shrink-0">
			<AvatarImage src={$userProfileQuery?.data?.image || `https://robohash.org/${selectedPubkey}`} alt={'displayName'} />
			<AvatarFallback>{$userProfileQuery?.data?.displayName}</AvatarFallback>
		</Avatar>
		<div class="overflow-hidden">
			<h2 class="font-semibold truncate">{$userProfileQuery?.data?.displayName}</h2>
			{#if $userProfileQuery?.data?.about}
				<p class="text-sm text-muted-foreground truncate">{$userProfileQuery?.data?.about}</p>
			{/if}
		</div>
	</div>

	<div bind:this={messagesContainerRef} class="flex-grow overflow-y-auto p-4 space-y-4">
		{#each messages as message (message.id)}
			{@const isCurrentUser = message.pubkey !== selectedPubkey}
			{@const decryptedMsg = $ndkStore.signer?.decrypt($ndkStore.getUser({ pubkey: selectedPubkey }), message.content)}
			<div class={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
				<div class={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[75%]`}>
					<Avatar class="h-8 w-8 mx-2 flex-shrink-0">
						<AvatarImage
							src={$userProfileQuery?.data?.image || `https://robohash.org/${message.pubkey}`}
							alt={$userProfileQuery?.data?.name || shortenPubkey(message.pubkey)}
						/>
						<AvatarFallback
							>{$userProfileQuery?.data?.name
								? $userProfileQuery?.data?.name[0].toUpperCase()
								: shortenPubkey(message.pubkey)[0]}</AvatarFallback
						>
					</Avatar>
					<div class={`bg-accent p-3 rounded-lg ${isCurrentUser ? 'rounded-br-none' : 'rounded-bl-none'}`}>
						<!-- <p class="whitespace-pre-wrap break-words">{message.content}</p> -->
						{#await decryptedMsg then _decryptedMsg}
							<p class="text-xs text-muted-foreground mt-1">
								{_decryptedMsg}
							</p>
						{/await}
						{#if message.created_at}
							<p class="text-xs text-muted-foreground mt-1">
								{new Date(message.created_at * 1000).toLocaleString()}
							</p>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<div class="p-4 border-t shrink-0">
		<div class="flex items-center gap-2">
			<Textarea
				bind:value={message}
				on:keydown={handleKeyPress}
				on:input={handleInputChange}
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
