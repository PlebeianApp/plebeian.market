<script lang="ts">
	import type { DisplayWallet } from '$lib/server/wallet.service'
	import NwcWallet from '$lib/components/settings/nwc-wallet.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { queryClient } from '$lib/fetch/client'
	import { walletKeys } from '$lib/fetch/query-key-factory'
	import { userWalletQuery } from '$lib/fetch/wallets.queries'
	import ndkStore from '$lib/stores/ndk'
	import { EncryptedStorage } from '$lib/utils'
	import { onMount } from 'svelte'

	let localWallets: DisplayWallet[] = []

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
	{#if $userWalletQuery.isLoading}
		<p>Loading...</p>
	{:else}
		{#each [...($userWalletQuery.data ?? []), ...localWallets] as wallet (wallet.id)}
			<NwcWallet nwcWallet={wallet} on:walletAdded={handleWalletAdded} on:walletDeleted={handleWalletDeleted} />
		{/each}
		{#if showEmptyWallet}
			<NwcWallet nwcWallet={undefined} on:walletAdded={handleWalletAdded} />
		{:else}
			<Button variant="primary" on:click={toggleEmptyWallet}>Add Another Wallet</Button>
		{/if}
	{/if}
</div>
