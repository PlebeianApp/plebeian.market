<script lang="ts">
	import Chat from '$lib/components/chat/chat.svelte'
	import { Button } from '$lib/components/ui/button'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	const { userId } = data
</script>

{#if userId}
	<div class="flex-1 overflow-hidden">
		<div class="h-full flex flex-col">
			<div class="p-2 border-none shrink-0">
				<Button size="icon" variant="ghost" class="p-2 border-0" on:click={nav_back}>
					<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
				</Button>
			</div>
			<div class="flex-1 overflow-hidden">
				<Chat selectedPubkey={userId} />
			</div>
		</div>
	</div>
{/if}
