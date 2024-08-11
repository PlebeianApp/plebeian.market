<script lang="ts">
	import type { NDKRelay } from '@nostr-dev-kit/ndk'
	import { NDKRelayStatus } from '@nostr-dev-kit/ndk'
	import ndkStore from '$lib/stores/ndk'
	import { onMount } from 'svelte'

	export let relay: NDKRelay
	export let expanded = false
	export let relayType: 'outbox' | 'kind3' = 'kind3'

	let notices: string[] = []
	$: relayConnectivity = relay.connectivity

	const noticeHandler = (notice: string) => {
		notices = [notice, ...notices]
	}

	onMount(() => {
		relay.on('notice', noticeHandler)
		relay.on('connect', () => (relayConnectivity = relay.connectivity))
		relay.on('disconnect', () => (relayConnectivity = relay.connectivity))
		relay.on('flapping', () => (relayConnectivity = relay.connectivity))

		return () => {
			relay.off('notice', noticeHandler)
			relay.off('connect', () => (relayConnectivity = relay.connectivity))
			relay.off('disconnect', () => (relayConnectivity = relay.connectivity))
			relay.off('flapping', () => (relayConnectivity = relay.connectivity))
		}
	})

	function handleRemoveRelay() {
		const removeRelay = relayType == 'kind3' ? $ndkStore.pool.removeRelay(relay.url) : $ndkStore.outboxPool?.removeRelay(relay.url)
		removeRelay && ndkStore.set($ndkStore)
	}
</script>

<li class="list-none flex flex-col">
	<div class="inline-flex items-center gap-2">
		<span
			class="w-2 h-4 rounded-full ml-2"
			class:bg-orange-400={relayConnectivity.status === NDKRelayStatus.CONNECTING ||
				relayConnectivity.status === NDKRelayStatus.RECONNECTING}
			class:bg-red-500={relayConnectivity.status === NDKRelayStatus.DISCONNECTED}
			class:bg-green-500={relayConnectivity.status === NDKRelayStatus.CONNECTED}
			class:bg-blue-500={relayConnectivity.status === NDKRelayStatus.FLAPPING}
			class:bg-red-600={relayConnectivity.status === NDKRelayStatus.AUTHENTICATING}
		/>

		<button
			class="flex items-center gap-2 w-full bg-transparent border-0 p-0 font-inherit cursor-pointer text-left"
			on:click={() => (expanded = !expanded)}
		>
			<span class="font-normal whitespace-nowrap overflow-hidden text-ellipsis">{relay.url}</span>
			{#if relayConnectivity.openSubs.size > 0}
				<div class="ml-2 float-right text-sm font-light cursor-pointer">
					{relayConnectivity.openSubs.size}{relayConnectivity.openSubs.size === 1 ? '+' : '++'}
				</div>
			{/if}
		</button>
		<button type="button" on:click={handleRemoveRelay}>
			<span class="i-tdesign-remove" />
		</button>
	</div>

	{#if relay.connectionStats.attempts > 1 && relayConnectivity.status !== NDKRelayStatus.CONNECTED}
		<div class="text-sm font-light mt-2">
			<small>
				Reconnection attempts: {relay.connectionStats.attempts}
			</small>
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
