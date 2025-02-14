<script lang="ts">
	import type { DisplayWallet } from '$lib/server/wallet.service'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import { deleteWalletMutation, persistWalletMutation, updateWalletMutation } from '$lib/fetch/wallets.mutations'
	import ndkStore from '$lib/stores/ndk'
	import { initNdkNWCs } from '$lib/stores/nwc'
	import { EncryptedStorage, nwcUriToWalletDetails } from '$lib/utils'
	import { createEventDispatcher, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import { z } from 'zod'

	import { nwcSchema } from '../../../schema/nwc-schema'
	import { Checkbox } from '../ui/checkbox'
	import MiniBalance from './mini-balance.svelte'
	import QrDialog from './qr-dialog.svelte'

	export let nwcWallet: DisplayWallet | undefined
	let showSecret = false
	let persistNwcToDB: boolean
	let walletPubKey = ''
	let walletRelays: string[] = []
	let walletSecret = ''
	let initialPersistNwcToDB: boolean
	let hasChanged = false

	const dispatch = createEventDispatcher()

	onMount(async () => {
		persistNwcToDB = Boolean(nwcWallet && !nwcWallet.id.startsWith('local-'))
		initialPersistNwcToDB = persistNwcToDB

		if (nwcWallet && 'walletPubKey' in nwcWallet.walletDetails) {
			walletPubKey = nwcWallet.walletDetails.walletPubKey
			walletRelays = nwcWallet.walletDetails.walletRelays
			walletSecret = nwcWallet.walletDetails.walletSecret
		}
	})

	$: {
		if (nwcWallet && 'walletPubKey' in nwcWallet.walletDetails) {
			hasChanged =
				walletPubKey !== nwcWallet.walletDetails.walletPubKey ||
				walletSecret !== nwcWallet.walletDetails.walletSecret ||
				persistNwcToDB !== initialPersistNwcToDB
		} else {
			hasChanged = walletPubKey !== '' || walletRelays.length > 0 || walletSecret !== '' || persistNwcToDB !== initialPersistNwcToDB
		}
	}

	let formErrors: { [key: string]: string } = {}

	async function validateForm() {
		try {
			await nwcSchema.parseAsync({
				walletPubKey,
				walletRelays: walletRelays.join(', '),
				walletSecret,
			})
			formErrors = {}
			return true
		} catch (error) {
			if (error instanceof z.ZodError) {
				formErrors = error.errors.reduce(
					(acc, err) => {
						if (err.path[0]) acc[err.path[0].toString()] = err.message
						return acc
					},
					{} as Record<string, string>,
				)
			}
			return false
		}
	}

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault()
		const isValid = await validateForm()

		if (!isValid) {
			toast.error('Please fix the form errors')
			return
		}

		const wallet = { walletPubKey, walletRelays, walletSecret }

		if (!persistNwcToDB) {
			await handleLocalStorage(wallet)
		} else {
			await handleDatabase(wallet)
		}

		if (nwcWallet) {
			dispatch('walletDeleted', nwcWallet.id)
		}

		hasChanged = false
		initNdkNWCs()
	}

	$: encryptedStorage = new EncryptedStorage($ndkStore.signer!)

	type WalletData = { walletPubKey: string; walletRelays: string[]; walletSecret: string }

	async function handleLocalStorage(wallet: WalletData) {
		const localWallets = JSON.parse((await encryptedStorage.getItem('nwc-wallets')) || '{}')
		const isExistingLocal = nwcWallet?.id?.startsWith('local-')

		if (isExistingLocal && nwcWallet) {
			localWallets[nwcWallet.id] = wallet
			await encryptedStorage.setItem('nwc-wallets', JSON.stringify(localWallets))
			toast.success('Local wallet updated')
			dispatch('walletAdded', { id: nwcWallet.id, wallet })
			return
		}

		// Handle migration from DB to local
		if (nwcWallet?.id && $ndkStore.activeUser?.pubkey) {
			await $deleteWalletMutation.mutateAsync({
				userId: $ndkStore.activeUser.pubkey,
				walletId: nwcWallet.id,
			})
		}

		const newId = `local-${Date.now()}`
		localWallets[newId] = wallet
		await encryptedStorage.setItem('nwc-wallets', JSON.stringify(localWallets))
		toast.success('Wallet saved locally')
		dispatch('walletAdded', { id: newId, wallet })
	}

	async function handleDatabase(wallet: WalletData) {
		const walletDetails = { walletType: 'nwc' as const, walletDetails: wallet }

		if (nwcWallet?.id?.startsWith('local-')) {
			const localWallets = JSON.parse((await encryptedStorage.getItem('nwc-wallets')) || '{}')
			delete localWallets[nwcWallet.id]
			await encryptedStorage.setItem('nwc-wallets', JSON.stringify(localWallets))
			await $persistWalletMutation.mutateAsync(walletDetails)
			toast.success('Wallet moved to database')
		} else if (nwcWallet?.id) {
			await $updateWalletMutation.mutateAsync({
				walletId: nwcWallet.id,
				walletDetails,
			})
			toast.success('Wallet updated')
		} else {
			await $persistWalletMutation.mutateAsync(walletDetails)
			toast.success('Wallet saved')
		}
		dispatch('walletAdded')
	}

	async function handleDelete() {
		if (!nwcWallet || !nwcWallet.id) return
		if (nwcWallet.id.startsWith('local-')) {
			const localWallets = JSON.parse((await encryptedStorage!.getItem(`nwc-wallets`)) || '{}')
			delete localWallets[nwcWallet.id]
			await encryptedStorage.setItem(`nwc-wallets`, JSON.stringify(localWallets))
			resetForm()
			toast.success('NWC Wallet deleted locally')
		} else if ($ndkStore.activeUser?.pubkey) {
			const deleteResult = await $deleteWalletMutation.mutateAsync({ userId: $ndkStore.activeUser.pubkey, walletId: nwcWallet.id })
			deleteResult && toast.success('NWC Wallet deleted')
		}
		dispatch('walletDeleted', nwcWallet.id)
	}

	function resetForm() {
		const form = document.querySelector('form')
		if (form) {
			form.reset()
		}
	}

	function handlePasteNWCUri() {
		navigator.clipboard.readText().then((text) => {
			const wallet = nwcUriToWalletDetails(text)
			if (wallet) {
				walletPubKey = wallet.walletPubKey
				walletRelays = wallet.walletRelays
				walletSecret = wallet.walletSecret
			}
		})
	}

	function handleQrScanToNWCUri(e: CustomEvent) {
		const wallet = e.detail
		if (wallet) {
			walletPubKey = wallet.walletPubKey
			walletRelays = wallet.walletRelays
			walletSecret = wallet.walletSecret
		}
	}

	function handleRelayChange(event: Event) {
		const value = (event.target as HTMLInputElement).value
		walletRelays = value.split(',').reduce((acc: string[], relay) => {
			const trimmed = relay.trim()
			if (trimmed) acc.push(trimmed)
			return acc
		}, [])
	}
</script>

<Collapsible.Root class="border-black border p-4 rounded-md" open={!nwcWallet?.walletDetails}>
	<div class="flex flex-row">
		<Collapsible.Trigger class="flex flex-row w-full items-center justify-between gap-2 mr-4">
			<div class="flex items-center gap-2 font-bold">
				<span class="i-mdi-purse w-6 h-6" />
				{#if nwcWallet?.id || nwcWallet?.walletDetails.walletRelays}
					<span>{nwcWallet?.id || nwcWallet?.walletDetails.walletRelays[0]}</span>
				{:else}
					<span>New wallet</span>
				{/if}
			</div>
			<span class="i-mdi-keyboard-arrow-down w-6 h-6" />
		</Collapsible.Trigger>
		{#if nwcWallet?.walletDetails}
			<MiniBalance wallet={nwcWallet?.walletDetails} walletId={nwcWallet?.id} />
		{/if}
	</div>

	<Collapsible.Content class="flex flex-col gap-4 py-4">
		<form on:submit|preventDefault={onSubmit}>
			<div class="pb-4 space-y-2">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold">Wallet Connect</h3>

					<div class="flex">
						<QrDialog on:validQrScanned={(e) => handleQrScanToNWCUri(e)} />
						<Button variant="ghost" on:click={handlePasteNWCUri} size="icon" class="text-destructive border-0">
							<span class="i-mingcute-clipboard-fill text-black w-6 h-6"></span>
						</Button>
					</div>
				</div>
				<div class="grid w-full items-center gap-1.5">
					<Label for="nwc-pubkey" class="font-bold">Wallet connect pubkey</Label>
					<Input bind:value={walletPubKey} type="text" id={`nwcPubkey=${nwcWallet?.id}`} name="nwc-pubkey" required />
					{#if formErrors.walletPubKey}
						<span class="text-red-500 text-sm">{formErrors.walletPubKey}</span>
					{/if}
				</div>

				<div class="grid w-full items-center gap-1.5">
					<Label for="nwc-relay" class="font-bold">Wallet connect relays</Label>
					<Input
						value={walletRelays.join(', ')}
						on:input={handleRelayChange}
						type="text"
						id={`nwcRelay=${nwcWallet?.id}`}
						name="nwc-relay"
						required
					/>
					{#if formErrors.walletRelays}
						<span class="text-red-500 text-sm">{formErrors.walletRelays}</span>
					{/if}
				</div>
				<div class="grid w-full items-center gap-1.5">
					<Label for="nwc-secret" class="font-bold">Wallet connect secret</Label>
					<div class="flex flex-row">
						<Input bind:value={walletSecret} type={showSecret ? 'text' : 'password'} id="nwc-secret" name="nwc-secret" required />
						<Button variant="ghost" on:click={() => (showSecret = !showSecret)} size="icon" class="text-destructive border-0">
							{#if showSecret}
								<span class="i-mdi-eye-outline w-4 h-4" />
							{:else}
								<span class="i-mdi-eye-off-outline w-4 h-4" />
							{/if}
							{#if formErrors.walletSecret}
								<span class="text-red-500 text-sm">{formErrors.walletSecret}</span>
							{/if}
						</Button>
					</div>
				</div>

				<div class="grid w-full items-center gap-1.5"></div>
				<div class="flex flex-row gap-2">
					<Button id={`userWalletSubmit=${nwcWallet?.id}`} class="w-full font-bold" type="submit" disabled={!hasChanged}>
						{nwcWallet ? 'Update' : 'Save'} Wallet
					</Button>
					<div class="grid w-full items-center gap-1.5 text-sm">
						<div class="flex items-center gap-2">
							<Checkbox id={`persistNwcToDB=${nwcWallet?.id}`} name="persist-nwc-locally" bind:checked={persistNwcToDB} />
							<p>Store wallet on server.</p>
						</div>
					</div>
					{#if nwcWallet}
						<Button variant="ghost" on:click={handleDelete} size="icon" class="text-destructive border-0">
							<span class="i-tdesign-delete-1 w-4 h-4" />
						</Button>
					{/if}
				</div>
			</div>
		</form>
	</Collapsible.Content>
</Collapsible.Root>
