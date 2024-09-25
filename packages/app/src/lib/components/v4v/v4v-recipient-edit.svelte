<script lang="ts">
	import type { NDKUserProfile, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import ndkStore from '$lib/stores/ndk'
	import { checkTargetUserHasLightningAddress, decodePk } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'

	import { Button } from '../ui/button'
	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import { Input } from '../ui/input'
	import Label from '../ui/label/label.svelte'

	const dispatch = createEventDispatcher()

	export let npub: string | undefined
	export let percentage: number
	let collapsibleOpen = false
	let recipientCanReceiveSats: NDKZapMethodInfo[] = []
	let previousNpub: string | undefined

	$: percentageEdit = Math.round(percentage * 100)

	let userProfile: NDKUserProfile | null = null

	async function fetchUserProfile() {
		if (npub && npub.startsWith('npub')) {
			const user = $ndkStore.getUser({ npub })
			userProfile = await user.fetchProfile()
			recipientCanReceiveSats = await checkTargetUserHasLightningAddress(user.pubkey)
		}
	}

	function handlePercentageChange(event: Event) {
		const target = event.target as HTMLInputElement
		const newPercentage = Math.round(Number(target.value))
		percentageEdit = Math.min(100, Math.max(0, newPercentage))
		dispatch('percentageChange', {
			npub,
			percentage: percentageEdit / 100,
		})
	}

	function handleAddRecipient(event: Event) {
		const target = event.target as HTMLInputElement
		const newNpub = target.value
		dispatch('recipientAdded', {
			npub: newNpub,
			percentage: percentageEdit / 100,
		})
	}

	function hadleRemoveRecipient() {
		dispatch('recipientRemoved', { npub })
	}

	$: {
		if (npub && npub.startsWith('npub') && npub !== previousNpub) {
			fetchUserProfile()
			previousNpub = npub
		} else if (!npub) {
			userProfile = null
			previousNpub = undefined
		}
	}
</script>

<Collapsible.Root class="border-black border p-4" bind:open={collapsibleOpen}>
	<div class="flex flex-row justify-between">
		<Collapsible.Trigger class="flex flex-row w-full items-center justify-between gap-2">
			{#if npub}
				<div class="flex items-center gap-2 font-bold">
					<CAvatar pubkey={decodePk(npub)} profile={userProfile} />
					{#if userProfile}
						<div>{userProfile.name}</div>
					{/if}
				</div>
			{:else}
				<div class="text-gray-400">New recipient</div>
			{/if}

			<div class="flex gap-2">
				{#if recipientCanReceiveSats.length === 0}
					<div class="flex flex-row items-center text-xs border border-black p-2">No methods<span class="i-mdi-remove w-3 h-3" /></div>
				{:else}
					{#each recipientCanReceiveSats as method}
						<div class="flex flex-row items-center text-xs border border-black p-2">{method.type} <span class="i-mdi-check w-3 h-3" /></div>
					{/each}
				{/if}

				<span class="i-mdi-keyboard-arrow-down w-6 h-6" />
			</div>
		</Collapsible.Trigger>

		{#if collapsibleOpen}
			<Input
				type="number"
				min={1}
				max={100}
				class="w-24"
				bind:value={percentageEdit}
				disabled={recipientCanReceiveSats.length === 0}
				on:change={handlePercentageChange}
			/>
		{:else}
			<span class="w-24"> {percentageEdit}%</span>
		{/if}
	</div>

	<Collapsible.Content class="flex flex-col gap-4 mt-5">
		<Label class="font-bold">Npub</Label>
		<div class="flex gap-2">
			<Input type="text" bind:value={npub} on:change={handleAddRecipient} />
			<Button type="button" on:click={hadleRemoveRecipient}>
				<span class="i-mdi-trash-can"></span>
			</Button>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
