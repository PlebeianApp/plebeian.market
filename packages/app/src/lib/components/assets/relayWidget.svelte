<script lang="ts">
	import { NDKRelay, NDKRelayAuthPolicies, normalizeRelayUrl } from '@nostr-dev-kit/ndk'
	import { defaulRelaysUrls } from '$lib/constants'
	import ndkStore from '$lib/stores/ndk'

	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'
	import Label from '../ui/label/label.svelte'
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte'
	import RelayList from './relayList.svelte'

	export let mode: 'widget' | 'settings' = 'widget'
	let isOpen = mode == 'settings'

	let inputRelayUrl = ''
	function handleAddRelay() {
		if (inputRelayUrl) {
			$ndkStore.pool.addRelay(new NDKRelay(normalizeRelayUrl(inputRelayUrl), NDKRelayAuthPolicies.signIn(), $ndkStore))
			ndkStore.set($ndkStore)
			inputRelayUrl = ''
		}
	}

	function handleConnectToDefaultRelays() {
		defaulRelaysUrls.forEach((relay) => {
			$ndkStore.pool.addRelay(new NDKRelay(normalizeRelayUrl(relay), NDKRelayAuthPolicies.signIn(), $ndkStore))
		})
		ndkStore.set($ndkStore)
	}
</script>

<div class="flex flex-col" class:gap-4={mode === 'settings'}>
	{#if mode === 'widget'}
		<Button
			data-tooltip="Manage your nostr relays!"
			size="icon"
			variant="tertiary"
			class="border border-gray"
			on:click={() => (isOpen = !isOpen)}
		>
			<span class="i-mdi-connection w-6 h-6" />
		</Button>
	{/if}

	{#if isOpen}
		<div class={`bg-white flex flex-col ${mode == 'widget' && 'w-fit p-2 border-black border-2 fixed bottom-0 z-50 gap-2'}`}>
			<div class="text-end">
				{#if mode === 'widget'}
					<Button size="icon" variant="ghost" on:click={() => (isOpen = !isOpen)}>
						<span class="i-mdi-close w-6 h-6" />
					</Button>
				{/if}
			</div>
			{#if $ndkStore.pool?.relays.size}
				<section>
					<span class=" font-bold">Explicit relays</span> ({$ndkStore.pool?.relays.size}):
					<ScrollArea class={`${$ndkStore.pool?.relays.size > 10 ? 'h-72' : ''}`}>
						{#each $ndkStore.pool.relays.values() as relay (relay.url)}
							<RelayList {relay} relayType="kind3" />
						{/each}
					</ScrollArea>
				</section>
			{:else}
				<div class="flex flex-col gap-2">
					You are not connected to any relay
					<Button on:click={handleConnectToDefaultRelays}>Use default relays</Button>
				</div>
			{/if}
			{#if $ndkStore.outboxPool?.relays.size}
				<section>
					<span class=" font-bold">Outbox relays</span> ({$ndkStore.outboxPool?.relays.size}):
					<ScrollArea class={`${$ndkStore.outboxPool?.relays.size > 10 ? 'h-72' : ''}`}>
						{#each $ndkStore.outboxPool.relays.values() as relay (relay.url)}
							<RelayList {relay} relayType="outbox" />
						{/each}
					</ScrollArea>
				</section>
			{/if}
			<form on:submit|preventDefault={handleAddRelay} class="flex flex-row gap-2 items-end w-full">
				<Label class="w-full flex flex-col gap-2">
					Add a relay
					<Input name="relayUrl" bind:value={inputRelayUrl} type="url" />
				</Label>
				<Button type="submit" variant="tertiary"><span class="i-tdesign-add text-black w-6 h-6"></span></Button>
			</form>
		</div>
	{/if}
</div>
