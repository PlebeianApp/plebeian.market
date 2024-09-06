<script lang="ts">
	import type { CashuPaymentInfo, NDKLnUrlData, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input'
	import ndkStore from '$lib/stores/ndk'
	import { payInvoiceWithFirstWorkingNWC } from '$lib/stores/nwc'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import Spinner from '../assets/spinner.svelte'
	import Button from '../ui/button/button.svelte'
	import LnDialog from './ln-dialog.svelte'

	type InvoiceInterface = 'qr' | 'nwc'

	export let userIdToZap: string

	let lightningInvoiceData: string | undefined

	let qrDialogOpen: boolean = false
	let userCanBeZapped: NDKZapMethodInfo[] = []
	let zapAmountSats: number = 2
	$: zapAmountMSats = zapAmountSats * 1000

	onMount(async () => {
		userCanBeZapped = await checkTargetUserHasLightningAddress()
	})

	const checkTargetUserHasLightningAddress = async () => {
		const user = $ndkStore.getUser({ pubkey: userIdToZap })
		const zapInfo = await user.getZapInfo()
		return zapInfo
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

		if (invoiceInterface === 'qr') {
			lightningInvoiceData = zapRes
			qrDialogOpen = true
		} else if (invoiceInterface === 'nwc') {
			const result = await payInvoiceWithFirstWorkingNWC(zapRes)

			if (!result.error) {
				toast.success('Zap successful')
			} else {
				console.log('zap failed:', result.error)
				toast.error(`Zap failed: ${result.error}`)
			}
		}
	}

	const hadleNip61Zap = async (info: CashuPaymentInfo, invoiceInterface: InvoiceInterface) => {
		const user = $ndkStore.getUser({ pubkey: userIdToZap })

		console.log('hadleNip61Zap:', info)
	}
</script>

<LnDialog {qrDialogOpen} {userIdToZap} {zapAmountSats} {lightningInvoiceData} on:zapSuccess={() => (qrDialogOpen = false)} />

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#if userCanBeZapped.length > 0}
			<Button size="icon" variant="secondary">
				<span class="i-mingcute-lightning-line w-6 h-6" />
			</Button>
		{:else}
			<Button size="icon" variant="secondary" disabled>
				<Spinner />
			</Button>
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label><Input bind:value={zapAmountSats} type="number" id={`zapAmount`} /></DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			{#each userCanBeZapped as zapTarget}
				<DropdownMenu.Item class="justify-between">
					<span>{zapTarget.type}</span>
					<div>
						<Button size="icon" variant="secondary" on:click={() => handleZapForType(zapTarget, 'qr')}
							><span class="i-mingcute-qrcode-line text-black w-6 h-6"></span></Button
						>
						<Button size="icon" variant="secondary" on:click={() => handleZapForType(zapTarget, 'nwc')}
							><span class="i-mdi-purse w-6 h-6" /></Button
						>
					</div>
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
