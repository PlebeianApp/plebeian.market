<script lang="ts">
	import QrCode from '@castlenine/svelte-qrcode'
	import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import ndkStore from '$lib/stores/ndk'
	import { copyToClipboard } from '$lib/utils'
	import { createEventDispatcher, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import Button from '../ui/button/button.svelte'

	export let userIdToZap: string
	export let qrDialogOpen: boolean = false
	export let zapAmountSats: number = 0
	export let lightningInvoiceData: string | undefined

	const dispatch = createEventDispatcher()

	onMount(async () => {
		console.log('subscruption start:', userIdToZap)
		$ndkStore
			.subscribe({
				kinds: [NDKKind.Zap],
				'#p': [userIdToZap],
				since: Math.round(Date.now() / 1000),
			})
			.on('event', (event: NDKEvent) => {
				const bolt11Tag = event.tagValue('bolt11')

				if (bolt11Tag && bolt11Tag === lightningInvoiceData) {
					toast.success('Zap successful')
					dispatch('zapSuccess', event)
				}
			})
	})
</script>

<Dialog.Root bind:open={qrDialogOpen}>
	<Dialog.Content class="max-w-[425px] gap-0 p-0 text-black">
		<Dialog.Header>
			<Dialog.Title>Lightning invoice for {zapAmountSats} sats</Dialog.Title>
			<Dialog.Description class="text-black">
				<span> Scan this invoice with your favourite lightning network wallet.</span>
			</Dialog.Description>
		</Dialog.Header>
		{#if lightningInvoiceData}
			<QrCode data={lightningInvoiceData} logoPath="/logo.svg" />
			<Button
				variant="secondary"
				class="relative overflow-auto flex flex-row gap-2 bg-transparent"
				on:click={() => copyToClipboard(lightningInvoiceData)}
			>
				<code class="truncate w-3/4">{lightningInvoiceData}</code>
				<span class="i-tdesign-copy" style="width: 1rem; height: 1rem; color: black;"></span>
			</Button>
		{/if}
		<Button on:click={() => (qrDialogOpen = false)} class="w-full font-bold">Cancel</Button>
	</Dialog.Content>
</Dialog.Root>
