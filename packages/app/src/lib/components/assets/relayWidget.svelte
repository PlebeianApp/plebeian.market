<script lang="ts">
	import { NDKRelay, NDKRelayAuthPolicies, normalizeRelayUrl } from '@nostr-dev-kit/ndk'
	import ndkStore from '$lib/stores/ndk'
	import { onMount } from 'svelte'

	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'
	import Label from '../ui/label/label.svelte'
	import RelayList from './relayList.svelte'

	export let mode: 'widget' | 'settings' = 'widget'
	let isOpen = false

	function toggleOpen() {
		isOpen = !isOpen
	}

	onMount(() => {
		mode == 'settings' && (isOpen = true)
	})

	$: containerStyle = mode == 'widget' ? ' w-fit p-2 border-black border-2 max-w-[25vw]' : 'flex flex-col gap-2'
	let inputRelayUrl = ''
	function handleAddRelay() {
		if (inputRelayUrl) {
			$ndkStore.pool.addRelay(new NDKRelay(normalizeRelayUrl(inputRelayUrl), NDKRelayAuthPolicies.signIn(), $ndkStore))
			ndkStore.set($ndkStore)
			inputRelayUrl = ''
		}
	}
</script>

<div class="flex flex-col" class:gap-4={mode == 'settings'}>
	{#if mode == 'widget'}
		<Button size="icon" variant="secondary" class=" border border-gray" on:click={toggleOpen}>
			<span class=" i-mdi-connection w-5 h-5" />
		</Button>
	{/if}

	{#if isOpen}
		<div class={`bg-white ${containerStyle} `}>
			{#if $ndkStore.pool?.relays.size}
				<section>
					Explicit relays:
					{#each $ndkStore.pool.relays.values() as relay}
						<RelayList {relay} relayType="kind3" />
					{/each}
				</section>
			{:else}
				No connected relay
			{/if}
			{#if $ndkStore.outboxPool?.relays.size}
				<section>
					Outbox relays:
					{#each $ndkStore.outboxPool.relays as relay}
						<RelayList relay={relay[1]} relayType="outbox" />
					{/each}
				</section>
			{/if}
		</div>
	{/if}
	{#if mode == 'settings'}
		<form on:submit|preventDefault={handleAddRelay} class="flex flex-row gap-2 items-end w-full">
			<Label class="w-full flex flex-col gap-2">
				Add a relay
				<Input name="relayUrl" bind:value={inputRelayUrl} type="url" />
			</Label>
			<Button type="submit"><span class=" i-tdesign-add text-black w-6 h-6"></span></Button>
		</form>
		<section class=" w-full flex justify-center gap-4">
			<Button disabled type="submit"><span class=" i-tdesign-add text-black w-6 h-6" /> Publish explicit relays</Button>
			<Button disabled type="submit"><span class=" i-tdesign-add text-black w-6 h-6" /> Publish outbox relays</Button>
		</section>
	{/if}
</div>
