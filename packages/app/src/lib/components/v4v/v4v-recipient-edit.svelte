<script lang="ts">
	import type { NDKUserProfile, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as Slider from '$lib/components/ui/slider'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { checkTargetUserHasLightningAddress, decodePk, getHexColorFingerprintFromHexPubkey, resolveQuery } from '$lib/utils'
	import { getProfileName } from '$lib/utils/userProfile.utils'
	import { createEventDispatcher } from 'svelte'

	import { Button } from '../ui/button'
	import CAvatar from '../ui/custom-components/c-avatar.svelte'
	import { Input } from '../ui/input'
	import Label from '../ui/label/label.svelte'
	import ProfileSearch from '../users/profile-search.svelte'

	const dispatch = createEventDispatcher<{
		percentageChange: { npub: string; percentage: number }
		recipientAdded: { npub: string; percentage: number }
		recipientRemoved: { npub: string }
	}>()

	export let npub: string | undefined
	export let percentage: number
	export let isNewRecipient = false

	let collapsibleOpen = isNewRecipient
	let recipientCanReceiveSats: NDKZapMethodInfo[] = []
	let userProfile: NDKUserProfile | null = null

	$: percentageEdit = Math.round(percentage * 100)
	$: sliderValue = [percentageEdit]
	$: hexPubkey = npub && decodePk(npub)
	$: hexColorFromPubkey = hexPubkey && getHexColorFingerprintFromHexPubkey(hexPubkey)

	$: if (npub && npub.startsWith('npub')) {
		fetchUserProfile()
	} else {
		resetRecipientState()
	}

	async function fetchUserProfile() {
		if (npub && npub.startsWith('npub')) {
			userProfile = await resolveQuery(() => createUserByIdQuery(hexPubkey, true, false, NDKSubscriptionCacheUsage.CACHE_FIRST))
			recipientCanReceiveSats = await checkTargetUserHasLightningAddress(hexPubkey)
		}
	}

	function handleSliderChange(value: number[]) {
		if (value[0] !== undefined && npub) {
			percentageEdit = value[0]
			dispatch('percentageChange', { npub, percentage: value[0] / 100 })
		}
	}

	function handleAddRecipient() {
		if (npub?.startsWith('npub')) {
			dispatch('recipientAdded', { npub, percentage: percentageEdit / 100 })
			isNewRecipient = false
		}
	}

	function handleRemoveRecipient() {
		npub && dispatch('recipientRemoved', { npub })
	}

	function resetRecipientState() {
		userProfile = null
		recipientCanReceiveSats = []
	}
</script>

<Collapsible.Root
	class="border-black border p-4 w-full bg-white"
	style={`border-left: 0.5rem solid ${hexColorFromPubkey}`}
	bind:open={collapsibleOpen}
>
	<div class="flex flex-row justify-between items-center">
		<Collapsible.Trigger class="flex-grow flex items-center justify-between gap-2">
			{#if npub}
				<div class="flex items-center gap-2 font-bold">
					<CAvatar pubkey={hexPubkey} profile={userProfile} />
					{#if userProfile}
						<div>{getProfileName(userProfile, hexPubkey)}</div>
					{/if}
				</div>
			{:else}
				<div class="text-gray-400">New recipient</div>
			{/if}

			<div class="flex gap-2">
				{#if recipientCanReceiveSats.length === 0}
					<div class="flex items-center text-xs border border-black p-2">
						No methods<span class="i-mdi-remove w-3 h-3" />
					</div>
				{:else}
					{#each recipientCanReceiveSats as method}
						<div class="flex items-center text-xs border border-black p-2">
							{method.type} <span class="i-mdi-check w-3 h-3" />
						</div>
					{/each}
				{/if}
				<span class="i-mdi-keyboard-arrow-down w-6 h-6" />
			</div>
		</Collapsible.Trigger>

		<span class="w-16 text-right font-bold"> {percentageEdit}%</span>
	</div>

	<Collapsible.Content class="flex flex-col gap-4 mt-5">
		<div class="space-y-2">
			<Label class="font-bold">Percentage</Label>
			<Slider.Root
				bind:value={sliderValue}
				onValueChange={handleSliderChange}
				min={0}
				max={100}
				step={1}
				disabled={recipientCanReceiveSats.length === 0}
			/>
		</div>

		<div class="space-y-2">
			<Label class="font-bold">Recipient</Label>
			<div class="space-y-2">
				{#if isNewRecipient}
					<div class="flex flex-col gap-4">
						<ProfileSearch
							on:select={({ detail }) => {
								npub = detail.npub
								handleAddRecipient()
							}}
						/>
					</div>
				{:else}
					<div class="flex gap-2">
						<Input type="text" value={npub} readonly />
						<Button type="button" variant="destructive" on:click={handleRemoveRecipient}>
							<span class="i-mdi-trash-can"></span>
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
