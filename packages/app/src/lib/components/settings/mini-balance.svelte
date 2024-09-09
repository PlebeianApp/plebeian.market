<script lang="ts">
	import type { NWCWallet } from '$lib/server/wallet.service'
	import { NDKNwc } from '@nostr-dev-kit/ndk'
	import ndkStore from '$lib/stores/ndk'
	import { NWC_TIMEOUT } from '$lib/stores/nwc'
	import { onDestroy, onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Button from '../ui/button/button.svelte'

	export let wallet: NWCWallet
	let walletBalance: number | undefined
	let displayFormat: 'sats' | 'btc' | 'msats' = 'sats'
	let getBalanceFailed = false

	let timeoutId: number | undefined

	onMount(async () => {
		const nwc = new NDKNwc({
			ndk: $ndkStore,
			pubkey: wallet.walletPubKey,
			relayUrls: wallet.walletRelays,
			secret: wallet.walletSecret,
		})

		const getBalanceWithTimeout = async () => {
			try {
				const balanceRes = await Promise.race([
					nwc.getBalance(),
					new Promise((_, reject) => {
						timeoutId = setTimeout(() => reject(new Error('Timeout')), NWC_TIMEOUT) as unknown as number
					}),
				])

				if (balanceRes) {
					walletBalance = balanceRes.result?.balance
				}
			} catch (error) {
				console.error('Failed to get balance:', error)
				getBalanceFailed = true
			} finally {
				clearTimeout(timeoutId)
			}
		}

		await getBalanceWithTimeout()
	})

	onDestroy(() => {
		if (timeoutId) clearTimeout(timeoutId)
	})

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

	$: formattedBalance = formatBalance(walletBalance, displayFormat)
</script>

<Button on:click={toggleFormat} variant="ghost" class="cursor-pointer">
	{#if walletBalance === undefined}
		{#if getBalanceFailed}
			<span class="i-mdi-dangerous w-6 h-6 text-destructive" />
		{:else}
			<span><Spinner /></span>
		{/if}
	{:else}
		<span>{formattedBalance}</span>
	{/if}
</Button>
