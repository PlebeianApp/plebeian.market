<script lang="ts">
	import type { NDKRelay } from '@nostr-dev-kit/ndk'
	import { NDKRelayStatus } from '@nostr-dev-kit/ndk'

	export let relay: NDKRelay
	export let expanded = false
	let notices: string[] = []
	$: relay.on('notice', (notice) => {
		notices = [notice, ...notices]
	})

	$: activeSubCount = relay.connectivity.openSubs.size
	setInterval(() => {
		activeSubCount = relay.connectivity.openSubs.size
	}, 1000)

	let nextReconnectIn: number | undefined
	let nextReconnectInterval: number

	setInterval(() => {
		if (!relay.connectionStats.nextReconnectAt || relay.connectionStats.nextReconnectAt! < Date.now()) {
			clearInterval(nextReconnectInterval)
			nextReconnectIn = undefined
			return
		}

		nextReconnectIn = Math.floor((relay.connectionStats.nextReconnectAt - Date.now()) / 1000)
	}, 1000)
</script>

<li class=" list-none">
	<button
		class="flex items-center gap-2 w-full bg-transparent border-0 p-0 font-inherit cursor-pointer text-left"
		on:click={() => (expanded = !expanded)}
	>
		{#if relay.status === NDKRelayStatus.CONNECTING || relay.status === NDKRelayStatus.RECONNECTING}
			<span class="w-2 h-2 rounded-full bg-orange-400 ml-2" />
		{:else if relay.status === NDKRelayStatus.DISCONNECTED}
			<span class="w-2 h-2 rounded-full bg-red-500 ml-2" />
		{:else if relay.status === NDKRelayStatus.CONNECTED}
			<span class="w-2 h-2 rounded-full bg-green-500 ml-2" />
		{:else if relay.status === NDKRelayStatus.FLAPPING}
			<span class="w-2 h-2 rounded-full bg-blue-500 ml-2" />
		{:else if relay.status === NDKRelayStatus.AUTHENTICATING}
			<span class="w-2 h-2 rounded-full bg-red-600 ml-2" />
		{/if}
		<span class="font-normal whitespace-nowrap overflow-hidden text-ellipsis">{relay.url}</span>
		{#if activeSubCount > 0}
			<div class="ml-2 float-right text-sm font-light cursor-pointer">
				{activeSubCount}
				{activeSubCount === 1 ? '+' : '++'}
			</div>
		{/if}
	</button>

	{#if relay.connectionStats.attempts > 1 && relay.status !== NDKRelayStatus.CONNECTED}
		<div class="text-sm font-light mt-2">
			<small>
				Reconnection attempts: {relay.connectionStats.attempts}
			</small>

			{#if nextReconnectIn}
				<small>
					Next reconnect in
					{nextReconnectIn} seconds
				</small>
			{/if}
		</div>
	{/if}
	{#if expanded}
		<small>Connection Attempts: {relay.connectionStats.attempts}, success: {relay.connectionStats.success}</small>
		{#if notices.length > 0}
			<ul>
				{#each notices as notice, i (i)}
					<li class="text-sm font-light bg-red-500 bg-opacity-50 rounded">{notice}</li>
				{/each}
			</ul>
		{/if}
	{/if}
</li>
