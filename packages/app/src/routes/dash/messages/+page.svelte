<script lang="ts">
	import { page } from '$app/stores'
	import Chat from '$lib/components/comms/chat.svelte'
	import ConversationListItem from '$lib/components/comms/conversation-list-item.svelte'
	import { Button } from '$lib/components/ui/button'
	import { activeUserDMs, groupedDMs } from '$lib/nostrSubs/subs'
	import { nav_back } from '$lib/utils'
	import { ArrowLeft } from 'lucide-svelte'

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
</script>

<div class="flex flex-col h-screen">
	<div class="flex items-center gap-1 p-4 shrink-0">
		<Button size="icon" variant="outline" class="border-none" on:click={() => nav_back()}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</Button>
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-gray-600">{linkDetails?.description}</p>
		</section>
	</div>

	<div class="flex-1 overflow-hidden">
		{#if selectedPubkey}
			<div class="h-full flex flex-col">
				<div class="p-2 border-b shrink-0">
					<Button variant="ghost" on:click={goBack} class="p-2">
						<ArrowLeft size={24} />
					</Button>
				</div>
				<div class="flex-1 overflow-hidden mx-auto">
					<Chat messages={$groupedDMs[selectedPubkey]} activeUserMessages={$activeUserDMs[selectedPubkey]} {selectedPubkey} />
				</div>
			</div>
		{:else}
			<div class="h-full overflow-y-auto">
				<div class="divide-y divide-border">
					{#each Object.entries($groupedDMs) as [pubkey, messages]}
						<ConversationListItem {pubkey} {messages} onSelect={selectConversation} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
