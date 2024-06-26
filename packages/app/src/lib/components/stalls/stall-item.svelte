<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import ndkStore from '$lib/stores/ndk'
	import { truncateString } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'

	export let stall: Partial<RichStall>

	const { name, createDate, description, currency, productCount, identifier, id } = stall
	let { userName, userNip05 } = stall

	onMount(async () => {
		if (!userName || !userNip05) {
			const user = $ndkStore.getUser({
				pubkey: id?.split(':')[1],
			})
			const userProfile = await user.fetchProfile()
			if (userProfile) {
				userName = userProfile?.name ?? userProfile.displayName
				userNip05 = userProfile.nip05
			}
		}
	})
</script>

<a href={userNip05 ? `/stalls/${userNip05.toLocaleLowerCase()}/${identifier}` : `/stalls/${id?.replace(/^30017:/, '')}`}>
	<Card.Root class="grid grid-rows-[auto_1fr_auto] h-[34vh] cursor-pointer gap-4 border-4 border-black bg-transparent text-black">
		<Card.Header class="flex flex-col justify-between py-2 pb-0">
			<span class="truncate text-2xl font-bold whitespace-normal">{name}</span>
			<span class="font-bold whitespace-normal">Since: {createDate}</span>
		</Card.Header>
		<Card.Content class="flex-grow overflow-hidden truncate whitespace-normal">{description}</Card.Content>

		<Card.Footer class="flex flex-col items-start font-bold">
			<div class="flex items-center gap-1">
				<div class="flex flex-col">
					{#if userName}
						<span class="whitespace-normal">Owner: {userName}</span>
					{/if}
					{#if userNip05}
						<small class="truncate font-light whitespace-normal">{userNip05}</small>
					{:else}
						<small class="font-light truncate whitespace-normal">@{truncateString(npubEncode(stall.userId))}</small>
					{/if}
				</div>
			</div>
			<span class="whitespace-normal">Currency: {currency}</span>
			{#if productCount}
				<span class="whitespace-normal">{productCount} products</span>
			{/if}
		</Card.Footer>
	</Card.Root>
</a>
