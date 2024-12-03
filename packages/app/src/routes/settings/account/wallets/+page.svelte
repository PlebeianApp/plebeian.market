<script lang="ts">
	import type { DisplayWallet } from '$lib/server/wallet.service'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import NwcWallet from '$lib/components/settings/nwc-wallet.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { queryClient } from '$lib/fetch/client'
	import { walletKeys } from '$lib/fetch/query-key-factory'
	import { userWalletQuery } from '$lib/fetch/wallets.queries'
	import ndkStore from '$lib/stores/ndk'
	import { EncryptedStorage } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	export let data: PageData
	let localWallets: DisplayWallet[] = []

	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)

	let showEmptyWallet = false

	function toggleEmptyWallet() {
		showEmptyWallet = !showEmptyWallet
	}

	function handleWalletAdded() {
		showEmptyWallet = false
		queryClient.invalidateQueries({ queryKey: walletKeys.all })
		loadLocalWallets()
		showEmptyWallet = false
	}

	async function handleWalletDeleted(event: CustomEvent<string>) {
		const deletedWalletId = event.detail
		if (deletedWalletId.startsWith('local-')) {
			localWallets = localWallets.filter((wallet) => wallet.id !== deletedWalletId)
		} else {
			queryClient.invalidateQueries({ queryKey: walletKeys.all })
		}
	}

	$: encryptedStorage = new EncryptedStorage($ndkStore.signer!)

	async function loadLocalWallets() {
		const nwcWalletsString = await encryptedStorage.getItem(`nwc-wallets`)
		if (nwcWalletsString) {
			const nwcWallets = JSON.parse(nwcWalletsString) as Record<string, DisplayWallet['walletDetails']>
			localWallets = Object.entries(nwcWallets).map(([id, walletDetails]) => ({
				id,
				userId: 'local',
				walletType: 'nwc',
				walletDetails,
			}))
		} else {
			localWallets = []
		}
	}

	onMount(loadLocalWallets)
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center gap-1">
		<Button size="icon" variant="outline" class="border-none" on:click={() => goto('/settings/account')}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</Button>
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-gray-600">{linkDetails?.description}</p>
		</section>
	</div>
	{#if $userWalletQuery.isLoading}
		<p>Loading...</p>
	{:else}
		{#each [...($userWalletQuery.data ?? []), ...localWallets] as wallet (wallet.id)}
			<NwcWallet nwcWallet={wallet} on:walletAdded={handleWalletAdded} on:walletDeleted={handleWalletDeleted} />
		{/each}
		{#if showEmptyWallet}
			<NwcWallet nwcWallet={undefined} on:walletAdded={handleWalletAdded} />
		{:else}
			<Button on:click={toggleEmptyWallet}>Add Another Wallet</Button>
		{/if}
	{/if}
</div>
