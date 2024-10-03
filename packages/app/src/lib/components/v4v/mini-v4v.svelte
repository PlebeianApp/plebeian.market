<script lang="ts">
	import type { NDKUserProfile, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import ndkStore from '$lib/stores/ndk'
	import { checkTargetUserHasLightningAddress, decodePk, formatSats, resolveQuery } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'

	import CAvatar from '../ui/custom-components/c-avatar.svelte'

	const dispatch = createEventDispatcher()

	type MethodInfoWithAmountCheck = NDKZapMethodInfo & { canReceive: boolean; max: number; min: number }

	export let npub: string | undefined
	export let percentage: number | undefined = undefined
	export let amountSats: number | undefined = undefined
	let recipientCanReceiveSats: MethodInfoWithAmountCheck[] = []
	let userProfile: NDKUserProfile | null = null

	async function fetchUserProfile() {
		if (npub) {
			const user = $ndkStore.getUser({ npub })
			userProfile = await resolveQuery(() => createUserByIdQuery(user.pubkey), 10, 500)
			const res = await checkTargetUserHasLightningAddress(user.pubkey)

			console.log('res', userProfile)

			recipientCanReceiveSats = res.map((method) => {
				const max = method.data.maxSendable / 1000
				const min = method.data.minSendable / 1000
				const canReceive = amountSats >= min && amountSats <= max
				return { ...method, canReceive, max, min }
			})
		}
	}

	$: {
		if (npub) {
			fetchUserProfile()
		}
	}
</script>

<div class="p-2 w-full">
	<div class="flex flex-row w-full items-center justify-between gap-2">
		{#if npub}
			<div class="flex items-center gap-2 font-bold">
				<CAvatar pubkey={decodePk(npub)} profile={userProfile} />
				{#if userProfile}
					<a href={`/p/${decodePk(npub)}`}>{userProfile.name}</a>
				{/if}
			</div>
		{:else}
			<div class="text-gray-400">New recipient</div>
		{/if}
		<div class="flex gap-6 justify-between">
			<div class="flex gap-2">
				{#if recipientCanReceiveSats.length === 0}
					<div class="flex flex-row items-center text-xs border border-black p-2">No methods<span class="i-mdi-remove w-3 h-3" /></div>
				{:else}
					{#each recipientCanReceiveSats as method}
						{#if method.canReceive}
							<div class="flex flex-row items-center text-xs border border-black p-2">
								{method.type} <span class="i-mdi-check w-3 h-3" />
							</div>
						{:else}
							<div class="flex flex-row items-center text-xs border border-black p-2">
								{method.type} <span class="i-mdi-remove w-3 h-3" />
							</div>
						{/if}
					{/each}
				{/if}
			</div>
			<div class="flex gap-2 items-center">
				{#if amountSats}
					<small>{formatSats(amountSats)} sats</small>
				{/if}
				{#if percentage}
					<small>({(percentage * 100).toFixed(2)}% of Subtotal)</small>
				{/if}
			</div>
		</div>
	</div>
</div>
