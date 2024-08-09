<script lang="ts">
	import ndkStore from '$lib/stores/ndk'

	import Button from '../ui/button/button.svelte'
	import RelayList from './relayList.svelte'

	let isOpen = false

	function toggleOpen() {
		isOpen = !isOpen
	}
</script>

<div class="sticky bottom-0">
	<Button size="icon" variant="secondary" class=" border-2" on:click={toggleOpen}>
		{#if isOpen}
			<span class=" i-tdesign-chevron-left" />
		{:else}
			<span class="i-tdesign-chevron-right" />
		{/if}
	</Button>

	{#if isOpen}
		<div class="bg-white w-fit p-2 border-black border-2">
			Explicit relays:
			{#each $ndkStore.pool.relays.values() as relay}
				<RelayList {relay} />
			{/each}
			{#if $ndkStore.outboxPool?.relays.size}
				Outbox relays:
				{#each $ndkStore.outboxPool.relays as relay}
					<RelayList relay={relay[1]} />
				{/each}
			{/if}
		</div>
	{/if}
</div>
