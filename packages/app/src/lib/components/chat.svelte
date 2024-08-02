<script lang="ts">
	import { Info, SendHorizontal } from 'lucide-svelte'
	import { afterUpdate, onMount } from 'svelte'

	import AvatarImage from './ui/avatar/avatar-image.svelte'
	import Avatar from './ui/avatar/avatar.svelte'
	import Textarea from './ui/textarea/textarea.svelte'

	export let messages = [
		{
			id: 1,
			name: 'Jane Doe',
			message: 'Hey, Jakob',
		},
		{
			id: 2,
			name: 'Jakob Hoeg',
			message: 'Hey!',
		},
		{
			id: 3,
			name: 'Jane Doe',
			message: 'How are you?',
		},
		{
			id: 4,
			name: 'Jakob Hoeg',
			message: 'I am good, you?',
		},
		{
			id: 5,
			name: 'Jane Doe',
			message: 'I am good too!',
		},
		{
			id: 6,
			name: 'Jakob Hoeg',
			message: 'That is good to hear!',
		},
		{
			id: 7,
			name: 'Jane Doe',
			message: 'How has your day been so far?',
		},
		{
			id: 8,
			name: 'Jakob Hoeg',
			message: 'It has been good. I went for a run this morning and then had a nice breakfast. How about you?',
		},
		{
			id: 9,
			name: 'Jane Doe',
			message: 'I had a relaxing day. Just catching up on some reading.',
		},
	]
	export let selectedUser = {
		name: 'Jane Doe',
	}

	let messagesContainerRef: HTMLDivElement
	let message = ''

	onMount(() => {
		if (messagesContainerRef) {
			messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight
		}
	})

	afterUpdate(() => {
		if (messagesContainerRef) {
			messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight
		}
	})

	function cn(...classes: string[]) {
		return classes.filter(Boolean).join(' ')
	}
	function handleInputChange(event: Event) {
		message = (event.target as HTMLTextAreaElement).value
	}

	function handleSend() {
		if (message.trim()) {
			const newMessage = {
				id: messages.length + 2,
				name: 'Jakob Hoeg',
				message: message.trim(),
			}
			messages = [...messages, newMessage]
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
</script>

<!-- Top Bar -->
<div class="w-full h-20 flex p-4 justify-between items-center border-b">
	<div class="flex items-center gap-2">
		<Avatar class="flex justify-center items-center">
			<AvatarImage src={'https://shadcn-chat.vercel.app/User1.png'} alt={selectedUser.name} width={6} height={6} class="w-10 h-10" />
		</Avatar>
		<div class="flex flex-col">
			<span class="font-medium">{selectedUser.name}</span>
		</div>
	</div>

	<div>
		<a href="/" class={cn('h-9 w-9', 'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white')}>
			<Info size={20} class="text-muted-foreground" />
		</a>
	</div>
</div>

<div class="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
	<div bind:this={messagesContainerRef} class="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
		{#each messages as message (message.id)}
			<div
				style="origin-x: 0.5; origin-y: 0.5;"
				class={cn('flex flex-col gap-2 p-4 whitespace-pre-wrap', message.name !== selectedUser.name ? 'items-end' : 'items-start')}
			>
				<div class="flex gap-3 items-center">
					{#if message.name === selectedUser.name}
						<Avatar class="flex justify-center items-center">
							<AvatarImage src={'https://shadcn-chat.vercel.app/User1.png'} alt={message.name} width={6} height={6} />
						</Avatar>
					{/if}
					<span class="bg-accent p-3 rounded-md max-w-xs">
						{message.message}
					</span>
					{#if message.name !== selectedUser.name}
						<Avatar class="flex justify-center items-center">
							<AvatarImage src={'https://shadcn-chat.vercel.app/LoggedInUser.jpg'} alt={message.name} width={6} height={6} />
						</Avatar>
					{/if}
				</div>
			</div>
		{/each}
	</div>
	<div class="p-2 flex justify-between w-full items-center gap-2">
		<div class="w-full relative">
			<Textarea
				bind:value={message}
				on:keydown={handleKeyPress}
				on:input={handleInputChange}
				name="message"
				placeholder="Aa"
				class="w-full border rounded-full flex items-center !min-h-9 resize-none overflow-hidden bg-background h-9"
			></Textarea>
		</div>
		{#if message.trim()}
			<button class={cn('h-6 w-6', 'shrink-0')} on:click={handleSend}>
				<SendHorizontal size={20} class="text-muted-foreground" />
			</button>
		{/if}
	</div>
</div>
