<script lang="ts">
	import type { NDKUserProfile, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import ndkStore from '$lib/stores/ndk'
	import { checkTargetUserHasLightningAddress, formatSats, resolveQuery } from '$lib/utils'
	import { getProfileName } from '$lib/utils/userProfile.utils'
	import { decode } from 'nostr-tools/nip19'
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
			userProfile = await resolveQuery(() => createUserByIdQuery(user.pubkey))
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

<div class="flex flex-col sm:flex-row gap-2 w-full">
	<div class="flex items-center gap-1.5 text-gray-700">
		{#if npub}
			{@const pubkey = decode(npub).data ?? ''}
			<div class="flex items-center gap-2 font-bold min-w-0">
				<CAvatar {pubkey} profile={userProfile} linked={false} />
				{#if userProfile}
					<span class="truncate">{getProfileName(userProfile, pubkey)}</span>
				{/if}
			</div>
		{:else}
			<div class="text-gray-400">New recipient</div>
		{/if}
		<slot />
	</div>

	<div class="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:ml-auto items-center">
		<div class="flex flex-wrap gap-1.5">
			{#if recipientCanReceiveSats.length === 0}
				<div class="flex items-center text-xs border border-black px-2 py-1 rounded-md">
					No methods
					<span class="i-mdi-remove w-3 h-3 ml-1" />
				</div>
			{:else}
				{#each recipientCanReceiveSats as method}
					<div class="flex items-center text-xs border border-black px-2 py-1 rounded-md">
						<span class="whitespace-nowrap">{method.type}</span>
						{#if method.canReceive}
							<span class="i-mdi-check w-3 h-3 ml-1 text-green-600" />
						{:else}
							<span class="i-mdi-remove w-3 h-3 ml-1 text-red-600" />
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<div class="flex items-center gap-1 sm:pl-3">
			{#if percentage}
				<span>{(percentage * 100).toFixed(2)}% subtotal:</span>
			{/if}
			{#if amountSats}
				<span class="font-medium">{formatSats(amountSats)} sats</span>
			{/if}
		</div>
	</div>
</div>
