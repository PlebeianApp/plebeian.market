<script lang="ts">
	import { goto } from '$app/navigation'
	import ConversationListItem from '$lib/components/chat/conversation-list-item.svelte'
	import { Button } from '$lib/components/ui/button'
	import { groupedDMs } from '$lib/nostrSubs/subs'
	import { chatNotifications, unreadCounts } from '$lib/stores/chat-notifications'

	function selectConversation(pubkey: string) {
		goto(`/dash/messages/${pubkey}`)
	}

	function handleMarkAllRead() {
		chatNotifications.markAllConversationsRead()
	}

	$: hasUnreadMessages = Object.values($unreadCounts).some((count) => count > 0)
</script>

<div class="flex flex-col h-screen max-w-6xl mx-auto">
	<div class="flex items-center justify-between p-4 shrink-0">
		{#if hasUnreadMessages}
			<Button variant="outline" size="sm" on:click={handleMarkAllRead} class="text-sm">Mark all as read</Button>
		{/if}
	</div>

	<div class="flex-1 overflow-hidden">
		<div class="h-full overflow-y-auto flex flex-col gap-2">
			{#each Object.entries($groupedDMs) as [pubkey, messages] (pubkey)}
				<ConversationListItem {pubkey} lastMessagets={Number(messages[0].created_at)} onSelect={selectConversation} />
			{/each}
		</div>
	</div>
</div>
