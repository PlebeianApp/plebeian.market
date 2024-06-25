<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'
	import ndkStore from '$lib/stores/ndk'
	import { onMount } from 'svelte'

	export let stall: Partial<RichStall>

	const { name, createDate, description, currency, productCount, identifier, id } = stall
	let { userName, userNip05 } = stall

	// TODO add data to insert in db
	// 	nostrStall.toNostrEvent().then((nostrEvent) => {
	// 	get(stallFromNostrEvent).mutateAsync(nostrEvent)
	// })

	// if (appSettings.allowRegister) {

	// }

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

<a href={userNip05 ? `/stalls/${userNip05}/${identifier}` : `/stalls/${id}`}>
	<Card.Root class="flex h-[34vh] cursor-pointer flex-col gap-4 border-4 border-black bg-transparent text-black">
		<Card.Header class="flex flex-col justify-between">
			<span class="truncate text-2xl font-bold">{name}</span>
			<span class="font-red font-bold">Since: {createDate}</span>
		</Card.Header>
		<Card.Content class="max-h-[33%] flex-grow overflow-hidden">{description}</Card.Content>

		<Card.Footer class="flex flex-col items-start font-bold">
			<div class=" flex items-center gap-1">
				<div class=" flex flex-col">
					{#if userName}
						<span class="">Owner: {userName}</span>
					{/if}
					{#if userNip05}
						<small class=" truncate font-light">{userNip05}</small>
					{/if}
				</div>
			</div>
			<span>Currency: {currency}</span>
			{#if productCount}
				<span>{productCount} products</span>
			{/if}
		</Card.Footer>
	</Card.Root>
</a>
