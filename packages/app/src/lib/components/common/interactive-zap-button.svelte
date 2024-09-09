<script lang="ts">
	import type { CashuPaymentInfo, NDKLnUrlData, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import ndkStore from '$lib/stores/ndk'
	import { payInvoiceWithFirstWorkingNWC } from '$lib/stores/nwc'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import LnDialog from './ln-dialog.svelte'

	type InvoiceInterface = 'qr' | 'nwc'

	const defaultZapAmounts = [
		{ displayText: '😊 10 sats', amount: 10 },
		{ displayText: '😄 21 sats', amount: 21 },
		{ displayText: '😃 50 sats', amount: 50 },
		{ displayText: '😁 100 sats', amount: 100 },
		{ displayText: '🤩 1,000 sats', amount: 1000 },
		{ displayText: '🚀 10,000 sats', amount: 10000 },
		{ displayText: '🔥 100,000 sats', amount: 100000 },
		{ displayText: '🤯 1,000,000 sats', amount: 1000000 },
	]
	export let userIdToZap: string

	let lightningInvoiceData: string | undefined

	let qrDialogOpen: boolean = false
	let isLoggedIn = false

	$: isLoggedIn = $ndkStore.activeUser !== undefined

	let userCanBeZapped: NDKZapMethodInfo[] = []
	let zapAmountSats: number = 2
	let zapMessage: string = 'Zap from Plebeian'
	let zapDialogOpen: boolean = false
	let nwcSpinnerShown = false
	$: zapAmountMSats = zapAmountSats * 1000

	onMount(async () => {
		userCanBeZapped = await checkTargetUserHasLightningAddress()
	})

	const checkTargetUserHasLightningAddress = async () => {
		const user = $ndkStore.getUser({ pubkey: userIdToZap })
		const zapInfo = await user.getZapInfo()
		return zapInfo
	}

	const startZapSubscription = () => {
		$ndkStore
			.subscribe({
				kinds: [NDKKind.Zap],
				'#p': [userIdToZap],
				since: Math.round(Date.now() / 1000),
			})
			.on('event', (event: NDKEvent) => {
				const bolt11Tag = event.tagValue('bolt11')

				console.log('event:', event)
				console.log('startZapSubscription:', bolt11Tag, lightningInvoiceData)

				if (bolt11Tag && bolt11Tag === lightningInvoiceData) {
					toast.success('Zap successful')
					nwcSpinnerShown = false

					setTimeout(() => {
						zapDialogOpen = false
					}, 200)
				}
			})
	}

	const handleZapForType = async (zapType: NDKZapMethodInfo, invoiceInterface: InvoiceInterface) => {
		const method = zapType.type

		const result = {
			nip57: () => hadleNip57Zap(zapType.data as NDKLnUrlData, invoiceInterface),
			nip61: () => hadleNip61Zap(zapType.data as CashuPaymentInfo, invoiceInterface),
		}[method]

		if (result) {
			await result()
		}
	}

	const hadleNip57Zap = async (info: NDKLnUrlData, invoiceInterface: InvoiceInterface) => {
		const user = $ndkStore.getUser({ pubkey: userIdToZap })
		const zapRes = (await user.zap(zapAmountMSats, `${zapAmountSats} zap`, undefined, $ndkStore.signer)) as string
		lightningInvoiceData = zapRes

		if (invoiceInterface === 'qr') {
			zapDialogOpen = false
			qrDialogOpen = true
		} else if (invoiceInterface === 'nwc') {
			nwcSpinnerShown = true
			startZapSubscription()
			const result = await payInvoiceWithFirstWorkingNWC(zapRes)
			if (!result.error) {
				toast.success('Zap successful')
			} else {
				toast.error(`Zap failed: ${result.error}`)
			}
		}
	}

	const hadleNip61Zap = async (info: CashuPaymentInfo, invoiceInterface: InvoiceInterface) => {
		const user = $ndkStore.getUser({ pubkey: userIdToZap })

		console.log('hadleNip61Zap:', info)
	}

	function handleZapAmountClick(amount: number) {
		zapAmountSats = amount
	}
</script>

<LnDialog {qrDialogOpen} {userIdToZap} {zapAmountSats} {lightningInvoiceData} on:zapSuccess={() => (qrDialogOpen = false)} />

<Dialog.Root bind:open={zapDialogOpen}>
	<Dialog.Content class="max-w-[425px] text-black">
		<Dialog.Header>
			<Dialog.Title>Zap</Dialog.Title>
			<Dialog.Description class="text-black">
				<span> Select an amount to zap to.</span>
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-2 p-4">
			{#each defaultZapAmounts as { displayText, amount }}
				<Button variant="outline" class="rounded-full" on:click={() => handleZapAmountClick(amount)}>
					{displayText}
				</Button>
			{/each}
		</div>

		<Label for="zapMessage" class="font-bold">Manual zap amount</Label>
		<Input bind:value={zapAmountSats} type="number" id={`zapAmount`} />

		<Label for="zapMessage" class="font-bold">Message</Label>
		<Input bind:value={zapMessage} type="text" class="w-full" id={`zapMessage`} />

		{#each userCanBeZapped as zapTarget}
			<div class="flex flex-row justify-between">
				<Button variant="secondary" on:click={() => handleZapForType(zapTarget, 'qr')}
					><span class="i-mingcute-qrcode-line text-black w-6 h-6 mr-2"></span>
					<span>Zap with QR.</span>
				</Button>
				<Button variant="secondary" on:click={() => handleZapForType(zapTarget, 'nwc')}
					><span class="i-mdi-purse w-6 h-6 mr-2" />
					<span>Zap with NWC.</span>
					{#if nwcSpinnerShown}
						<Spinner />
					{/if}
				</Button>
			</div>
		{/each}
	</Dialog.Content>
</Dialog.Root>

{#if userCanBeZapped.length > 0}
	<Button size="icon" variant="secondary" on:click={() => (zapDialogOpen = true)} disabled={!isLoggedIn}>
		<span class="i-mingcute-lightning-line w-6 h-6" />
	</Button>
{:else}
	<Button size="icon" variant="secondary" disabled>
		<Spinner />
	</Button>
{/if}
