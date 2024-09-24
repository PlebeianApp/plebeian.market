<script lang="ts">
	import type { NWCWallet } from '$lib/server/wallet.service'
	import { NDKNwc } from '@nostr-dev-kit/ndk'
	import { createWalletBalanceQuery } from '$lib/fetch/wallets.queries'
	import ndkStore from '$lib/stores/ndk'

	import Spinner from '../assets/spinner.svelte'
	import Button from '../ui/button/button.svelte'

	export let wallet: NWCWallet
	export let walletId: string = ''
	let displayFormat: 'sats' | 'btc' | 'msats' = 'sats'
	let getBalanceFailed = false

	const nwc = new NDKNwc({
		ndk: $ndkStore,
		pubkey: wallet.walletPubKey,
		relayUrls: wallet.walletRelays,
		secret: wallet.walletSecret,
	})
	const walletBalanceQuery = createWalletBalanceQuery(nwc, walletId)

	function toggleFormat() {
		if (displayFormat === 'sats') displayFormat = 'btc'
		else if (displayFormat === 'btc') displayFormat = 'msats'
		else displayFormat = 'sats'
	}

	function formatBalance(balance: number | undefined, format: 'sats' | 'btc' | 'msats'): string {
		if (balance === undefined) return ''

		const sats = balance / 1000

		switch (format) {
			case 'btc':
				return (sats / 100000000).toFixed(8) + ' BTC'
			case 'msats':
				return balance.toLocaleString() + ' mSats'
			default:
				return sats.toLocaleString() + ' sats'
		}
	}

	$: formattedBalance = $walletBalanceQuery.data ? formatBalance($walletBalanceQuery.data, displayFormat) : undefined
</script>

<Button on:click={toggleFormat} variant="ghost" class="cursor-pointer">
	{#if $walletBalanceQuery.data === undefined}
		{#if getBalanceFailed}
			<span class="i-mdi-dangerous w-6 h-6 text-destructive" />
		{:else}
			<span><Spinner /></span>
		{/if}
	{:else}
		<span>{formattedBalance}</span>
	{/if}
</Button>
