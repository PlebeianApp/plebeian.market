<script lang="ts">
	import { page } from '$app/stores'
	import NwcWallet from '$lib/components/settings/nwc-wallet.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { userWalletQuery } from '$lib/fetch/wallets.queries'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	// TODO: switches for more wallet types
	const { WalletTypes } = data

	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center gap-1">
		<Button size="icon" variant="outline" class="border-none" on:click={() => nav_back()}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</Button>
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-gray-600">{linkDetails?.description}</p>
		</section>
	</div>
	{#if $userWalletQuery.isLoading}
		<p>Loading...</p>
	{:else if $userWalletQuery.data.length === 0}
		{@const nwcWalletString = localStorage.getItem('nwc-wallet')}
		{#if nwcWalletString}
			<NwcWallet
				nwcWallet={{
					id: 'local',
					userId: 'local',
					walletType: 'nwc',
					walletDetails: JSON.parse(nwcWalletString),
				}}
			/>
		{:else}
			<p>No wallets found. Add a new wallet below.</p>
			<NwcWallet nwcWallet={undefined} />
		{/if}
	{:else}
		{#each [...($userWalletQuery.data ?? [])] as wallet}
			<NwcWallet nwcWallet={wallet} />
		{/each}
	{/if}
</div>
