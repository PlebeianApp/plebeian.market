<script lang="ts">
	import { NDKRelay, NDKRelayAuthPolicies, normalizeRelayUrl } from '@nostr-dev-kit/ndk'
	import ndkStore, { defaulRelaysUrls } from '$lib/stores/ndk'

	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'
	import Label from '../ui/label/label.svelte'
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
		<Button size="icon" variant="secondary" class="border border-gray" on:click={() => (isOpen = !isOpen)}>
			<span class="i-mdi-connection w-5 h-5" />
		</Button>
	{/if}

	{#if isOpen}
		<div class={`bg-white flex flex-col gap-2 ${mode == 'widget' && 'w-fit p-2 border-black border-2 max-w-[25vw]'}`}>
			{#if $ndkStore.pool?.relays.size}
				<section>
					Explicit relays:
					{#each $ndkStore.pool.relays.values() as relay (relay.url)}
						<RelayList {relay} relayType="kind3" />
					{/each}
				</section>
			{:else}
				<div class="flex flex-col gap-2">
					You are not connected to any relay
					<Button on:click={handleConnectToDefaultRelays}>Use default relays</Button>

					<!-- <small>*You can configure your relays in the <a href="/settings/account/network">settings</a> </small> -->
				</div>
			{/if}
			{#if $ndkStore.outboxPool?.relays.size}
				<section>
					Outbox relays:
					{#each $ndkStore.outboxPool.relays.values() as relay (relay.url)}
						<RelayList {relay} relayType="outbox" />
					{/each}
				</section>
			{/if}
			<form on:submit|preventDefault={handleAddRelay} class="flex flex-row gap-2 items-end w-full">
				<Label class="w-full flex flex-col gap-2">
					Add a relay
					<Input name="relayUrl" bind:value={inputRelayUrl} type="url" />
				</Label>
				<Button type="submit"><span class="i-tdesign-add text-black w-6 h-6"></span></Button>
			</form>
		</div>
	{/if}
</div>
