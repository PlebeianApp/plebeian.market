<script lang="ts">
	import type { CashuPaymentInfo, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import { DEFAULT_ZAP_AMOUNTS } from '$lib/constants'
	import { queryClient } from '$lib/fetch/client'
	import ndkStore from '$lib/stores/ndk'
	import { payInvoiceWithFirstWorkingNWC } from '$lib/stores/nwc'
	import { onMount, tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	import LnDialog from './ln-dialog.svelte'

	type InvoiceInterface = 'qr' | 'nwc'

	export let userIdToZap: string

	let zapAmountSats = 0
	let zapMessage = 'Zap from Plebeian'
	let userCanBeZapped: NDKZapMethodInfo[] = []
	let isLoading = true
	let lightningInvoiceData: string | undefined
	let qrDialogOpen = false
	let zapDialogOpen = false
	let nwcSpinnerShown = false

	$: zapAmountMSats = zapAmountSats * 1000

	let zapSubscription: (() => void) | undefined

	onMount(async () => {
		const checkZapInfoTimeout = setTimeout(() => {
			if (userCanBeZapped.length === 0) {
				isLoading = false
			}
		}, 5000)

		userCanBeZapped = await checkTargetUserHasLightningAddress()
		clearTimeout(checkZapInfoTimeout)
		isLoading = false

		// Ensure the component updates after setting isLoading
		await tick()
	})

	async function checkTargetUserHasLightningAddress(): Promise<NDKZapMethodInfo[]> {
		const user = $ndkStore.getUser({ pubkey: userIdToZap })
		try {
			return await user.getZapInfo()
		} catch (error) {
			console.error('Failed to get zap info:', error)
			return []
		}
	}

	function startZapSubscription() {
		const subscription = $ndkStore
			.subscribe({
				kinds: [NDKKind.Zap],
				'#p': [userIdToZap],
				since: Math.round(Date.now() / 1000),
			})
			.on('event', (event: NDKEvent) => {
				const bolt11Tag = event.tagValue('bolt11')
				if (bolt11Tag && bolt11Tag === lightningInvoiceData) {
					toast.success('Zap successful')
					nwcSpinnerShown = false
					if (zapSubscription) {
						zapSubscription()
						zapSubscription = undefined
					}
					setTimeout(() => (zapDialogOpen = false), 200)
				}
			})

		return () => subscription.stop()
	}

	async function handleZapForType(zapType: NDKZapMethodInfo, invoiceInterface: InvoiceInterface) {
		const method = zapType.type
		const handlers = {
			nip57: () => handleNip57Zap(invoiceInterface),
			nip61: () => handleNip61Zap(zapType.data as CashuPaymentInfo, invoiceInterface),
		}
		if (handlers[method]) await handlers[method]()
	}

	async function handleNip57Zap(invoiceInterface: InvoiceInterface) {
		const user = $ndkStore.getUser({ pubkey: userIdToZap })
		const zapRes = await user.zap(zapAmountMSats)
		if (typeof zapRes !== 'string') {
			zapDialogOpen = false
			return toast.error('Zap failed')
		}
		lightningInvoiceData = zapRes

		if (invoiceInterface === 'qr') {
			zapDialogOpen = false
			qrDialogOpen = true
		} else if (invoiceInterface === 'nwc') {
			nwcSpinnerShown = true
			zapSubscription = startZapSubscription()
			const paidInvoice = await payInvoiceWithFirstWorkingNWC(zapRes)
			if (!paidInvoice.error) {
				// TODO: invlaidating can be improved
				await queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
			}
		}
	}

	async function handleNip61Zap(info: CashuPaymentInfo, invoiceInterface: InvoiceInterface) {
		const user = $ndkStore.getUser({ pubkey: userIdToZap })
		console.log('handleNip61Zap:', info)
		// TODO: Implementation needed
	}
</script>

<LnDialog
	bind:qrDialogOpen
	{userIdToZap}
	{zapAmountSats}
	{lightningInvoiceData}
	on:zapSuccess={() => (qrDialogOpen = false)}
	on:zapExpired={() => (zapDialogOpen = false)}
/>

<Dialog.Root bind:open={zapDialogOpen}>
	<Dialog.Content class="max-w-[425px] text-black">
		<Dialog.Header>
			<Dialog.Title>Zap</Dialog.Title>
			<Dialog.Description class="text-black">
				<span>Select an amount to zap to.</span>
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-2">
			{#each DEFAULT_ZAP_AMOUNTS as { displayText, amount }}
				<Button variant="outline" class="border-2 border-black" on:click={() => (zapAmountSats = amount)}>
					{displayText}
				</Button>
			{/each}
		</div>

		<Label for="zapAmount" class="font-bold">Manual zap amount</Label>
		<Input bind:value={zapAmountSats} class="border-2 border-black" type="number" id="zapAmount" />

		<Label for="zapMessage" class="font-bold">Message</Label>
		<Input bind:value={zapMessage} class="border-2 border-black" type="text" id="zapMessage" />

		{#if userCanBeZapped.length}
			<div class="flex flex-row justify-between">
				<Button variant="secondary" on:click={() => handleZapForType(userCanBeZapped[0], 'qr')}>
					<span class="i-mingcute-qrcode-line text-black w-6 h-6 mr-2"></span>
					<span>Zap with QR</span>
				</Button>
				<Button variant="secondary" on:click={() => handleZapForType(userCanBeZapped[0], 'nwc')}>
					<span class="i-mdi-purse w-6 h-6 mr-2" />
					<span>Zap with NWC</span>
					{#if nwcSpinnerShown}
						<Spinner />
					{/if}
				</Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

{#if isLoading}
	<Button size="icon" variant="secondary" disabled>
		<Spinner />
	</Button>
{:else if userCanBeZapped.length > 0}
	<Button size="icon" variant="secondary" on:click={() => (zapDialogOpen = true)} disabled={!$ndkStore.activeUser}>
		<span class="i-mingcute-lightning-line w-6 h-6" />
	</Button>
{:else}
	<Button data-tooltip="User cannot be zapped." size="icon" variant="secondary" disabled>
		<span class="i-mingcute-lightning-line w-6 h-6" />
	</Button>
{/if}
