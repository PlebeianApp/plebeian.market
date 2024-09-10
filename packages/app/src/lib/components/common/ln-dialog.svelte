<script lang="ts">
	import type { NDKSubscription } from '@nostr-dev-kit/ndk'
	import QrCode from '@castlenine/svelte-qrcode'
	import { decode } from '@gandlaf21/bolt11-decode'
	import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import ndkStore from '$lib/stores/ndk'
	import { copyToClipboard, truncateText } from '$lib/utils'
	import { createEventDispatcher, onDestroy } from 'svelte'
	import { toast } from 'svelte-sonner'

	import Button from '../ui/button/button.svelte'

	export let userIdToZap: string
	export let qrDialogOpen = false
	export let zapAmountSats = 0
	export let lightningInvoiceData: string | undefined

	const dispatch = createEventDispatcher()

	let subscription: NDKSubscription | undefined
	let expiryTimestamp: number | null = null
	let timeLeft: number | null = null
	let interval: ReturnType<typeof setInterval> | undefined

	$: if (qrDialogOpen && lightningInvoiceData) {
		const decodedInvoice = decode(lightningInvoiceData)
		expiryTimestamp = Date.now() / 1000 + decodedInvoice.expiry
		setupCountdown()
		setupSubscription()
	} else {
		cleanup()
	}

	function setupCountdown() {
		clearInterval(interval)
		interval = setInterval(() => {
			if (expiryTimestamp !== null) {
				const now = Date.now() / 1000
				timeLeft = Math.max(0, Math.floor(expiryTimestamp - now))

				if (timeLeft <= 0) {
					handleExpiry()
				}
			}
		}, 1000)
	}

	function setupSubscription() {
		if (subscription) subscription.stop()
		subscription = $ndkStore.subscribe({
			kinds: [NDKKind.Zap],
			'#p': [userIdToZap],
			since: Math.round(Date.now() / 1000),
		})

		subscription.on('event', handleZapEvent)
	}

	function cleanup() {
		if (subscription) {
			subscription.stop()
			subscription = undefined
		}
		clearInterval(interval)
		expiryTimestamp = null
		timeLeft = null
	}

	function handleZapEvent(event: NDKEvent) {
		if (event.tagValue('bolt11') === lightningInvoiceData) {
			toast.success('LN Zap successful')
			dispatch('zapSuccess', event)
		}
	}

	function handleExpiry() {
		toast.error('Zap expired')
		dispatch('zapExpired')
	}

	function handleCopyClick() {
		if (lightningInvoiceData) {
			copyToClipboard(lightningInvoiceData)
			toast.success('Invoice copied to clipboard')
		}
	}

	function formatTime(seconds: number | null): string {
		if (seconds === null) return '--:--'
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	}

	onDestroy(cleanup)
</script>

<Dialog.Root bind:open={qrDialogOpen}>
	<Dialog.Content class="max-w-[425px] text-black">
		<Dialog.Header>
			<Dialog.Title>Lightning invoice for {zapAmountSats} sats</Dialog.Title>
			<Dialog.Description class="text-black">Scan this invoice with your favourite lightning network wallet.</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col items-center gap-2">
			{#if lightningInvoiceData}
				<QrCode data={lightningInvoiceData} logoPath="/logo.svg" />
				<Button variant="secondary" class="relative overflow-auto flex flex-row gap-2 bg-transparent" on:click={handleCopyClick}>
					<code>{truncateText(lightningInvoiceData, 30)}</code>
					<span class="i-tdesign-copy" style="width: 1rem; height: 1rem; color: black;"></span>
				</Button>
				<p class="text-sm text-gray-500">
					Expires in: {formatTime(timeLeft)}
				</p>
			{/if}
		</div>
		<Button on:click={() => (qrDialogOpen = false)} class="w-full font-bold">Cancel</Button>
	</Dialog.Content>
</Dialog.Root>
