<script lang="ts">
	import type { NDKRelay } from '@nostr-dev-kit/ndk'
	import { NDKRelayStatus } from '@nostr-dev-kit/ndk'
	import ndkStore from '$lib/stores/ndk'

	export let relay: NDKRelay
	export let expanded = false
	export let relayType: 'outbox' | 'kind3' = 'kind3'
	let notices: string[] = []
	$: relay.on('notice', (notice) => {
		notices = [notice, ...notices]
	})

	$: activeSubCount = relay.connectivity.openSubs.size
	$: reactiveStatus = relay.connectivity.status
	setInterval(() => {
		activeSubCount = relay.connectivity.openSubs.size
		reactiveStatus = relay.connectivity.status
	}, 2000)

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

	function handleRemoveRelay(relay: NDKRelay) {
		const removeRelay = relayType == 'kind3' ? $ndkStore.pool.removeRelay(relay.url) : $ndkStore.outboxPool?.removeRelay(relay.url)
		removeRelay && ndkStore.set($ndkStore)
	}
</script>

<li class=" list-none flex flex-col">
	<div class=" inline-flex items-center gap-2">
		{#if reactiveStatus === NDKRelayStatus.CONNECTING || reactiveStatus === NDKRelayStatus.RECONNECTING}
			<span class="w-2 h-4 rounded-full bg-orange-400 ml-2" />
		{:else if reactiveStatus === NDKRelayStatus.DISCONNECTED}
			<span class="w-2 h-4 rounded-full bg-red-500 ml-2" />
		{:else if reactiveStatus === NDKRelayStatus.CONNECTED}
			<span class="w-2 h-4 rounded-full bg-green-500 ml-2" />
		{:else if reactiveStatus === NDKRelayStatus.FLAPPING}
			<span class="w-2 h-4 rounded-full bg-blue-500 ml-2" />
		{:else if reactiveStatus === NDKRelayStatus.AUTHENTICATING}
			<span class="w-2 h-4 rounded-full bg-red-600 ml-2" />
		{/if}

		<button
			class="flex items-center gap-2 w-full bg-transparent border-0 p-0 font-inherit cursor-pointer text-left"
			on:click={() => (expanded = !expanded)}
		>
			<span class="font-normal whitespace-nowrap overflow-hidden text-ellipsis">{relay.url}</span>
			{#if activeSubCount > 0}
				<div class="ml-2 float-right text-sm font-light cursor-pointer">
					{activeSubCount}
					{activeSubCount === 1 ? '+' : '++'}
				</div>
			{/if}
		</button>
		<button type="button" on:click={() => handleRemoveRelay(relay)}>
			<span class=" i-tdesign-remove" />
		</button>
	</div>

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
