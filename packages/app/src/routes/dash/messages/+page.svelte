<script lang="ts">
	import { page } from '$app/stores'
	import Chat from '$lib/components/chat/chat.svelte'
	import ConversationListItem from '$lib/components/chat/conversation-list-item.svelte'
	import { Button } from '$lib/components/ui/button'
	import { groupedDMs, lastSeen } from '$lib/nostrSubs/subs'
	import { nav_back } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData

	const linkDetails = data.menuItems.find((item) => item.value === 'messages')?.links.find((item) => item.href === $page.url.pathname)
	let selectedPubkey: string | null = null

	function selectConversation(pubkey: string) {
		selectedPubkey = pubkey
	}

	function goBack() {
		selectedPubkey = null
	}

	onMount(() => {
		lastSeen.set(Date.now())
	})
</script>

<div class="flex flex-col h-screen max-w-6xl mx-auto">
	{#if !selectedPubkey}
		<div class="flex items-center gap-1 p-4 shrink-0">
			<Button size="icon" variant="ghost" class="border-0" on:click={() => nav_back()}>
				<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
			</Button>
			<section>
				<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
				<p class="text-sm text-muted-foreground">{linkDetails?.description}</p>
			</section>
		</div>
	{/if}

	<div class="flex-1 overflow-hidden">
		{#if selectedPubkey}
			<div class="h-full flex flex-col">
				<div class="p-2 border-none shrink-0">
					<Button size="icon" variant="ghost" class="p-2 border-0" on:click={goBack}>
						<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
					</Button>
				</div>
				<div class="flex-1 overflow-hidden">
					<Chat {selectedPubkey} />
				</div>
			</div>
		{:else}
			<div class="h-full overflow-y-auto flex flex-col gap-2">
				{#each Object.entries($groupedDMs) as [pubkey, messages]}
					<ConversationListItem {pubkey} lastMessages={Number(messages[0].created_at)} onSelect={selectConversation} />
				{/each}
			</div>
		{/if}
	</div>
</div>
