<script lang="ts">
	import type { NDKNwcResponse, NDKUserProfile, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import { Invoice } from '@getalby/lightning-tools'
	import { NDKEvent, NDKKind, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Dialog from '$lib/components/ui/dialog'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import Switch from '$lib/components/ui/switch/switch.svelte'
	import { DEFAULT_ZAP_AMOUNTS } from '$lib/constants'
	import { queryClient } from '$lib/fetch/client'
	import ndkStore from '$lib/stores/ndk'
	import { canPayWithNWC, payInvoiceWithNWC, updateBalanceOfWorkingNWCs } from '$lib/stores/nwc'
	import { checkTargetUserHasLightningAddress } from '$lib/utils'
	import { LN_ADDRESS_REGEX } from '$lib/utils/zap.utils'
	import { generateSecretKey } from 'nostr-tools'
	import { onDestroy, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import LnDialog from './ln-dialog.svelte'

	export let userIdToZap: string
	export let profile: NDKUserProfile

	let zapAmountSats = 0
	let zapMessage = 'Zap from Plebeian'
	let zapMethods: NDKZapMethodInfo[] = []
	let isLoading = true
	let isAnonymousZap = !$ndkStore.activeUser
	let lightningInvoiceData: string | undefined
	let qrDialogOpen = false
	let zapDialogOpen = false
	let nwcSpinnerShown = false

	$: user = $ndkStore.getUser({ pubkey: userIdToZap })
	$: user.profile = profile
	$: zapAmountMSats = zapAmountSats * 1000
	$: userCanBeZapped = user.profile?.lud16 && LN_ADDRESS_REGEX.test(user.profile.lud16)
	$: canUseNWC = canPayWithNWC(zapAmountSats)
	$: canUseWebln = 'webln' in window

	onMount(async () => {
		if (user.profile && userCanBeZapped) {
			zapMethods = await checkTargetUserHasLightningAddress(userIdToZap, user.profile)
		}
		isLoading = false
	})

	const zapSubscription = $ndkStore
		.subscribe({
			kinds: [NDKKind.Zap],
			'#p': [userIdToZap],
			since: Math.round(Date.now() / 1000),
		})
		.on('event', handleZapEvent)

	function handleZapEvent(event: NDKEvent) {
		const bolt11Tag = event.tagValue('bolt11')
		if (bolt11Tag === lightningInvoiceData) {
			toast.success('Zap successful')
			nwcSpinnerShown = false
			zapDialogOpen = false
		}
	}

	async function handleZap(invoiceInterface: 'qr' | 'nwc' | 'webln') {
		const zapRes = await user.zap(
			zapAmountMSats,
			zapMessage,
			undefined,
			isAnonymousZap ? new NDKPrivateKeySigner(generateSecretKey()) : undefined,
		)

		if (typeof zapRes !== 'string') {
			toast.error('Zap failed')
			return
		}

		lightningInvoiceData = zapRes
		const handlers = {
			qr: handleQrPayment,
			nwc: handleNwcPayment,
			webln: handleWeblnPayment,
		}

		await handlers[invoiceInterface](zapRes)
	}

	function handleQrPayment(invoice: string) {
		zapDialogOpen = false
		qrDialogOpen = true
	}

	async function handleNwcPayment(invoice: string) {
		if (!invoice) return
		nwcSpinnerShown = true
		const invoiceObject = new Invoice({ pr: invoice })
		isLoading = true
		try {
			const paidInvoice = await payInvoiceWithNWC(invoiceObject.paymentRequest, invoiceObject.satoshi)
			if (!paidInvoice.error && paidInvoice.result) {
				toast.success('Payment success!')
				await queryClient.resetQueries({ queryKey: ['wallet-balance'] })
				updateBalanceOfWorkingNWCs()
				nwcSpinnerShown = false
			} else {
				throw new Error(`${paidInvoice.error}`)
			}
		} catch (error) {
			console.error('NWC payment error:', error)
			toast.error('NWC payment failed')
		} finally {
			isLoading = false
			nwcSpinnerShown = false
		}
	}

	async function handleWeblnPayment(invoice: string) {
		const invoiceObject = new Invoice({ pr: invoice })
		try {
			await window.webln.enable()
			const response = await window.webln.sendPayment(invoiceObject.paymentRequest)
			const paid = await invoiceObject.validatePreimage(response.preimage)
			if (paid) {
				toast.success('WebLN payment successful')
				setTimeout(() => (zapDialogOpen = false), 200)
			}
		} catch (error) {
			console.error('WebLN payment error:', error)
			toast.error('WebLN payment failed')
		}
	}

	onDestroy(() => zapSubscription.stop())
</script>

<Dialog.Root bind:open={zapDialogOpen}>
	<Dialog.Content class="max-w-[425px] text-black">
		<Dialog.Header>
			<Dialog.Title>Zap</Dialog.Title>
			<Dialog.Description class="text-black">Select an amount to zap.</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-2">
			{#each DEFAULT_ZAP_AMOUNTS as { displayText, amount }}
				<Button variant="outline" class="border-2 border-black" on:click={() => (zapAmountSats = amount)}>
					{displayText}
				</Button>
			{/each}
		</div>

		<Label for="zapAmount" class="font-bold">Manual zap amount</Label>
		<Input bind:value={zapAmountSats} class="border-2 border-black" type="number" id="zapAmount" min={0} />

		<Label for="zapMessage" class="font-bold">Message</Label>
		<Input bind:value={zapMessage} class="border-2 border-black" type="text" id="zapMessage" />

		<Label for="isAnonymousZap" class="font-bold">Anonymous zap</Label>
		<Switch bind:checked={isAnonymousZap} class="border-2 border-black" id="isAnonymousZap" disabled={!$ndkStore.activeUser} />

		{#if zapMethods.length}
			<div class="grid grid-cols-[auto_auto] justify-center gap-2">
				<Button variant="secondary" on:click={() => handleZap('qr')}>
					<span class="i-mingcute-qrcode-line text-black w-6 h-6 mr-2" />
					<span>Zap with QR</span>
				</Button>
				{#if canUseNWC}
					<Button variant="secondary" on:click={() => handleZap('nwc')}>
						<span class="i-mdi-purse w-6 h-6 mr-2" />
						<span>Zap with NWC</span>
						{#if nwcSpinnerShown}
							<Spinner />
						{/if}
					</Button>
				{/if}
				{#if canUseWebln}
					<Button variant="secondary" on:click={() => handleZap('webln')}>
						<span class="i-mdi-lightning-bolt w-6 h-6 mr-2" />
						<span>Zap with WebLN</span>
					</Button>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

{#if lightningInvoiceData}
	<LnDialog
		bind:qrDialogOpen
		{userIdToZap}
		{zapAmountSats}
		bolt11String={lightningInvoiceData}
		on:zapSuccess={() => (qrDialogOpen = false)}
		on:zapExpired={() => (zapDialogOpen = false)}
	/>
{/if}

{#if isLoading}
	<Button size="icon" variant="secondary" disabled>
		<Spinner />
	</Button>
{:else if zapMethods.length > 0}
	<Button size="icon" variant="secondary" on:click={() => (zapDialogOpen = true)}>
		<span class="i-mingcute-lightning-line w-6 h-6" />
	</Button>
{:else}
	<Button data-tooltip="User cannot be zapped." size="icon" variant="secondary" disabled>
		<span class="i-mingcute-lightning-line w-6 h-6" />
	</Button>
{/if}
