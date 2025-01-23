<script lang="ts">
	import type { NDKSubscription } from '@nostr-dev-kit/ndk'
	import QrCode from '@castlenine/svelte-qrcode'
	import { page } from '$app/stores'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { copyToClipboard, truncateText } from '$lib/utils'
	import { createInvoiceObject, formatTime, handleZapEvent, setupExpiryCountdown, setupZapSubscription } from '$lib/utils/zap.utils'
	import { addSeconds } from 'date-fns'
	import { createEventDispatcher, onDestroy } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { PageData } from '../../../routes/$types'
	import Button from '../ui/button/button.svelte'

	$: ({ appSettings } = $page.data as PageData)
	export let qrDialogOpen = false
	export let zapAmountSats = 0
	export let bolt11String: string

	$: lnInvoice = createInvoiceObject(bolt11String)
	let subscription: NDKSubscription | undefined
	let timeLeft: number | null = null
	let cleanupCountdown: () => void

	const dispatch = createEventDispatcher()

	$: if (qrDialogOpen && lnInvoice?.expiry) {
		setupZapListener()
		setupCountdown()
	} else {
		cleanup()
	}

	function setupZapListener() {
		if (subscription) subscription.stop()
		subscription = setupZapSubscription((event) =>
			handleZapEvent(event, lnInvoice, () => {
				toast.success('Zap successful')
				dispatch('zapSuccess', event)
			}),
		)
	}

	function setupCountdown() {
		const now = new Date()
		const expiryDate = addSeconds(now, lnInvoice.expiry!)

		cleanupCountdown = setupExpiryCountdown(expiryDate, (secondsLeft) => (timeLeft = secondsLeft), handleExpiry)
	}

	function cleanup() {
		if (subscription) {
			subscription.stop()
			subscription = undefined
		}
		if (cleanupCountdown) cleanupCountdown()
		dispatch('zapCleanup')
		timeLeft = null
	}

	function handleExpiry() {
		toast.error('Zap expired')
		dispatch('zapExpired')
	}

	function handleCopyClick() {
		if (lnInvoice) {
			copyToClipboard(lnInvoice.paymentRequest)
			toast.success('Invoice copied to clipboard')
		}
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
			{#if lnInvoice}
				<a
					href={`lightning://${lnInvoice.paymentRequest}`}
					class="block hover:opacity-90 transition-opacity"
					target="_blank"
					rel="noopener noreferrer"
				>
					{#key lnInvoice.paymentRequest}
						<QrCode data={lnInvoice.paymentRequest} logoPath={appSettings.logoUrl} />
					{/key}
				</a>
				<Button variant="tertiary" class="relative overflow-auto flex flex-row gap-2 bg-transparent" on:click={handleCopyClick}>
					<code>{truncateText(lnInvoice.paymentRequest, 30)}</code>
					<span class="i-tdesign-copy" style="width: 1rem; height: 1rem; color: black;"></span>
				</Button>
				<p class="text-sm text-gray-500">
					Expires in: {formatTime(timeLeft)}
				</p>
			{/if}
		</div>
		<Button variant="destructive" on:click={() => (qrDialogOpen = false)} class="w-full font-bold">Cancel</Button>
	</Dialog.Content>
</Dialog.Root>
