<script lang="ts">
	import { groupedDMs } from '$lib/nostrSubs/subs'

	import ConversationListItem from './conversation-list-item.svelte'

	export let onSelectConversation: (pubkey: string) => void
</script>

<div class="divide-y divide-border">
	{#each Object.entries($groupedDMs) as [pubkey, messages]}
		<ConversationListItem {pubkey} {messages} onSelect={onSelectConversation} />
	{/each}
</div>
