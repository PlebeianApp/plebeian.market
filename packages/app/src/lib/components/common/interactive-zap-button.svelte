<script lang="ts">
	import type { NDKUserProfile, NDKZapMethodInfo } from '@nostr-dev-kit/ndk'
	import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
	import Spinner from '$lib/components/assets/spinner.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as Dialog from '$lib/components/ui/dialog'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import Switch from '$lib/components/ui/switch/switch.svelte'
	import { DEFAULT_ZAP_AMOUNTS } from '$lib/constants'
	import ndkStore from '$lib/stores/ndk'
	import { balanceOfWorkingNWCs, canPayWithNWC } from '$lib/stores/nwc'
	import { checkTargetUserHasLightningAddress } from '$lib/utils'
	import {
		createInvoiceObject,
		handleNWCPayment,
		handleWebLNPayment,
		handleZapEvent,
		LN_ADDRESS_REGEX,
		setupZapSubscription,
	} from '$lib/utils/zap.utils'
	import { generateSecretKey } from 'nostr-tools'
	import { onDestroy, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import LnDialog from './ln-dialog.svelte'

	export let userIdToZap: string
	export let profile: NDKUserProfile

	let zapMessage = 'Zap from Plebeian'
	let zapMethods: NDKZapMethodInfo[] = []
	let isLoading = true
	let isAnonymousZap = !$ndkStore.activeUser
	let lightningInvoiceData: string | undefined
	let qrDialogOpen = false
	let zapDialogOpen = false
	let spinnerShown = false
	let advancedSettingsOpen = false
	let canUseWebln = typeof window !== 'undefined' ? 'webln' in window : false

	$: zapAmountSats = 21
	$: user = $ndkStore.getUser({ pubkey: userIdToZap })
	$: zapAmountMSats = zapAmountSats * 1000
	$: userCanBeZapped = profile?.lud16 && LN_ADDRESS_REGEX.test(profile?.lud16)
	let canUseNWC = canPayWithNWC(zapAmountSats)

	$: if ($balanceOfWorkingNWCs) {
		canUseNWC = canPayWithNWC(zapAmountSats)
	}

	const zapSubscription = setupZapSubscription((event) => {
		const invoice = createInvoiceObject(lightningInvoiceData!)
		handleZapEvent(event, invoice, () => {
			spinnerShown = false
			zapDialogOpen = false
		})
	})

	async function handleZap(invoiceInterface: 'qr' | 'nwc' | 'webln') {
		spinnerShown = true
		const zapRes = (await user.zap(
			zapAmountMSats,
			zapMessage,
			undefined,
			isAnonymousZap ? new NDKPrivateKeySigner(generateSecretKey()) : undefined,
		)) as string
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

	function handleQrPayment() {
		zapDialogOpen = false
		qrDialogOpen = true
	}

	async function handleNwcPayment(invoice: string) {
		if (!invoice) return
		spinnerShown = true
		isLoading = true
		const invoiceObject = createInvoiceObject(invoice)

		await handleNWCPayment(
			invoiceObject,
			async (preimage) => {
				toast.success('Payment success!')
				spinnerShown = false
				zapDialogOpen = false
			},
			(error) => {
				toast.error(`NWC payment failed: ${error}`)
			},
		)

		isLoading = false
		spinnerShown = false
	}
	async function handleWeblnPayment(invoice: string) {
		const invoiceObject = createInvoiceObject(invoice)

		await handleWebLNPayment(
			invoiceObject,
			(preimage) => {
				toast.success('WebLN payment successful')
				setTimeout(() => (zapDialogOpen = false), 200)
			},
			(error) => {
				toast.error(`WebLN payment failed: ${error}`)
			},
		)
	}

	onMount(async () => {
		if (profile && userCanBeZapped) {
			zapMethods = await checkTargetUserHasLightningAddress(userIdToZap)
		}
		isLoading = false
	})

	onDestroy(() => {
		zapSubscription.stop()
		spinnerShown = false
	})
</script>

{#if isLoading}
	<Button variant="outline" size="icon" disabled>
		<Spinner />
	</Button>
{:else if zapMethods.length > 0}
	<Button variant="focus" size="icon" on:click={() => (zapDialogOpen = true)}>
		<span class=" i-mingcute-lightning-fill w-6 h-6" />
	</Button>
{:else}
	<Button variant="secondary" data-tooltip="User cannot be zapped." size="icon" disabled>
		<span class="i-mingcute-lightning-fill w-6 h-6" />
	</Button>
{/if}

<Dialog.Root bind:open={zapDialogOpen}>
	<Dialog.Content class="max-w-[425px] text-black">
		<Dialog.Header>
			<Dialog.Title>Zap <small>({profile?.lud16})</small></Dialog.Title>
			<Dialog.Description class="text-black">
				Amount: <span class="font-bold">{zapAmountSats} sats</span>
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-2 gap-2 mb-4">
			{#each DEFAULT_ZAP_AMOUNTS as { displayText, amount }}
				<Button
					variant={amount === zapAmountSats ? 'tertiary' : 'outline'}
					class="border-2 border-black"
					on:click={() => (zapAmountSats = amount)}
					disabled={spinnerShown}
				>
					{displayText}
				</Button>
			{/each}
		</div>
		<Label for="zapMessage" class="font-bold mt-4">Message</Label>
		<Input bind:value={zapMessage} class="border-2 border-black" type="text" id="zapMessage" disabled={spinnerShown} />
		<Collapsible.Root bind:open={advancedSettingsOpen}>
			<Collapsible.Trigger asChild let:builder>
				<Button variant="outline" class="w-full mb-2" builders={[builder]} disabled={spinnerShown}>
					Advanced Settings
					<span class="i-lucide-chevron-down ml-2" />
				</Button>
			</Collapsible.Trigger>
			<Collapsible.Content>
				<div class="space-y-2 mt-2 flex flex-col">
					<Label for="zapAmount" class="font-bold">Manual zap amount</Label>
					<Input bind:value={zapAmountSats} class="border-2 border-black" type="number" id="zapAmount" min={0} disabled={spinnerShown} />

					<Label for="isAnonymousZap" class="font-bold">Anonymous zap</Label>
					<Switch
						bind:checked={isAnonymousZap}
						class="border-2 border-black"
						id="isAnonymousZap"
						disabled={!$ndkStore.activeUser || spinnerShown}
					/>
				</div>
			</Collapsible.Content>
		</Collapsible.Root>

		{#if spinnerShown}
			<div class="w-full flex justify-center mt-4">
				<Spinner />
			</div>
		{/if}

		{#if zapMethods.length && zapAmountSats > 0}
			<div class="grid grid-cols-[auto_auto] justify-center gap-2 mt-4">
				<Button variant="primary" on:click={() => handleZap('qr')} disabled={spinnerShown}>
					<span class="i-mingcute-qrcode-line w-6 h-6 mr-2" />
					<span>Zap with QR</span>
				</Button>
				{#if canUseNWC}
					<Button variant="primary" on:click={() => handleZap('nwc')} disabled={spinnerShown}>
						<span class="i-mdi-purse w-6 h-6 mr-2" />
						<span>Zap with NWC</span>
					</Button>
				{/if}
				{#if canUseWebln}
					<Button variant="primary" on:click={() => handleZap('webln')} disabled={spinnerShown}>
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
		{zapAmountSats}
		bolt11String={lightningInvoiceData}
		on:zapSuccess={() => (qrDialogOpen = false)}
		on:zapExpired={() => (zapDialogOpen = false)}
		on:zapCleanup={() => (spinnerShown = false)}
	/>
{/if}
