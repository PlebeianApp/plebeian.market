<script lang="ts">
	import Chat from '$lib/components/chat/chat.svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { userId } = data
</script>

{#if userId}
	<div style={`height: calc(100vh - 10vh)`} class="flex flex-col">
		<div class="flex-1 overflow-hidden">
			<div class="h-full flex flex-col">
				<div class="flex-1 overflow-hidden">
					<Chat selectedPubkey={userId} />
				</div>
			</div>
		</div>
	</div>
{/if}
