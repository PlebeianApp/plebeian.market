<script lang="ts">
	import type { DisplayWallet, NWCWallet } from '$lib/server/wallet.service'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import { deleteWalletMutation, persistWalletMutation, updateWalletMutation } from '$lib/fetch/wallets.mutations'
	import { copyToClipboard, nwcUriToWalletDetails } from '$lib/utils'
	import { createEventDispatcher, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import { Checkbox } from '../ui/checkbox'

	export let nwcWallet: DisplayWallet | undefined
	let showSecret = false
	let persistNwcToDB: boolean

	let walletPubKey = ''
	let walletRelay = ''
	let walletSecret = ''
	let initialPersistNwcToDB: boolean
	let hasChanged = false

	const dispatch = createEventDispatcher()

	onMount(() => {
		persistNwcToDB = Boolean(nwcWallet && !nwcWallet.id.startsWith('local-'))
		initialPersistNwcToDB = persistNwcToDB
		if (nwcWallet) {
			walletPubKey = nwcWallet.walletDetails.walletPubKey
			walletRelay = nwcWallet.walletDetails.walletRelay
			walletSecret = nwcWallet.walletDetails.walletSecret
		}
	})

	$: {
		if (nwcWallet) {
			hasChanged =
				walletPubKey !== nwcWallet.walletDetails.walletPubKey ||
				walletRelay !== nwcWallet.walletDetails.walletRelay ||
				walletSecret !== nwcWallet.walletDetails.walletSecret ||
				persistNwcToDB !== initialPersistNwcToDB
		} else {
			hasChanged = walletPubKey !== '' || walletRelay !== '' || walletSecret !== '' || persistNwcToDB !== initialPersistNwcToDB
		}
	}

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault()
		const wallet = { walletPubKey, walletRelay, walletSecret }

		if (!persistNwcToDB) {
			const localWallets = JSON.parse(localStorage.getItem('nwc-wallets') || '{}')
			if (nwcWallet && nwcWallet.id.startsWith('local-')) {
				localWallets[nwcWallet.id] = wallet
				localStorage.setItem('nwc-wallets', JSON.stringify(localWallets))
				toast.success('Local wallet updated')
				dispatch('walletAdded', { id: nwcWallet.id, wallet })
			} else {
				if (nwcWallet && !nwcWallet.id.startsWith('local-')) {
					await $deleteWalletMutation.mutateAsync(nwcWallet.id)
				}
				const newId = `local-${Date.now()}`
				localWallets[newId] = wallet
				localStorage.setItem('nwc-wallets', JSON.stringify(localWallets))
				toast.success('Wallet saved locally')
				dispatch('walletAdded', { id: newId, wallet })
			}
		} else {
			if (nwcWallet && nwcWallet.id.startsWith('local-')) {
				const localWallets = JSON.parse(localStorage.getItem('nwc-wallets') || '{}')
				delete localWallets[nwcWallet.id]
				localStorage.setItem('nwc-wallets', JSON.stringify(localWallets))
				await $persistWalletMutation.mutateAsync({ walletType: 'nwc', walletDetails: wallet })
				toast.success('Wallet moved to database')
			} else if (nwcWallet) {
				await $updateWalletMutation.mutateAsync({ walletId: nwcWallet.id, walletDetails: { walletType: 'nwc', walletDetails: wallet } })
				toast.success('Wallet updated')
			} else {
				await $persistWalletMutation.mutateAsync({ walletType: 'nwc', walletDetails: wallet })
				toast.success('Wallet saved')
			}
			dispatch('walletAdded')
		}

		if (nwcWallet) {
			dispatch('walletDeleted', nwcWallet.id)
		}

		hasChanged = false
	}

	const handleDelete = () => {
		if (!nwcWallet || !nwcWallet.id) return
		if (nwcWallet.id.startsWith('local-')) {
			const localWallets = JSON.parse(localStorage.getItem('nwc-wallets') || '{}')
			delete localWallets[nwcWallet.id]
			localStorage.setItem('nwc-wallets', JSON.stringify(localWallets))
			resetForm()
			toast.success('NWC Wallet deleted locally')
		} else {
			$deleteWalletMutation.mutateAsync(nwcWallet.id)
			dispatch('walletDeleted', nwcWallet.id)
			toast.success('NWC Wallet deleted')
		}
		dispatch('walletDeleted', nwcWallet.id)
	}

	const resetForm = () => {
		const form = document.querySelector('form')
		if (form) {
			form.reset()
		}
	}

	const handlePasteNWCUri = () => {
		navigator.clipboard.readText().then((text) => {
			try {
				const { walletPubKey: wp, walletRelay: wr, walletSecret: ws } = nwcUriToWalletDetails(text)

				walletPubKey = wp
				walletRelay = wr
				walletSecret = ws
			} catch (e) {
				toast.error('Invalid NWC URI in clipboard')
			}
		})
	}
</script>

<Collapsible.Root class="border-black border p-2" open={!nwcWallet?.walletDetails}>
	<div class="flex flex-row">
		<Collapsible.Trigger class="flex flex-row w-full items-center justify-between gap-2">
			<div class="flex items-center gap-2 font-bold">
				<span class="i-mdi-purse w-6 h-6" />
				{#if nwcWallet?.walletDetails}
					<span>{nwcWallet?.walletDetails.walletRelay}</span>
				{:else}
					<span>New wallet</span>
				{/if}
			</div>
			<span class="i-mdi-keyboard-arrow-down w-6 h-6" />
		</Collapsible.Trigger>
	</div>

	<Collapsible.Content class="flex flex-col gap-4 py-4">
		<form on:submit|preventDefault={onSubmit}>
			<div class="pb-4 space-y-2">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold">Wallet Connect</h3>

					<Button on:click={handlePasteNWCUri} size="icon" variant="ghost" class="text-destructive border-0">
						<span class="i-mingcute-clipboard-fill text-black w-6 h-6"></span>
					</Button>
				</div>
				<div class="grid w-full items-center gap-1.5">
					<Label for="nwc-pubkey" class="font-bold">Wallet connect pubkey</Label>
					<Input bind:value={walletPubKey} type="text" id={`nwcPubkey=${nwcWallet?.id}`} name="nwc-pubkey" />
				</div>

				<div class="grid w-full items-center gap-1.5">
					<Label for="nwc-relay" class="font-bold">Wallet connect relay</Label>
					<Input bind:value={walletRelay} type="url" id={`nwcRelay=${nwcWallet?.id}`} name="nwc-relay" />
				</div>
				<div class="grid w-full items-center gap-1.5">
					<Label for="nwc-secret" class="font-bold">Wallet connect secret</Label>
					<div class="flex flex-row">
						<Input bind:value={walletSecret} type={showSecret ? 'text' : 'password'} id="nwc-secret" name="nwc-secret" />
						<Button on:click={() => (showSecret = !showSecret)} size="icon" variant="ghost" class="text-destructive border-0">
							{#if showSecret}
								<span class="i-mdi-eye-outline w-4 h-4" />
							{:else}
								<span class="i-mdi-eye-off-outline w-4 h-4" />
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
						<!-- <Label for="persist-nwc-locally" class="font-bold">Persist NWC only locally</Label> -->
						<div class="flex items-center gap-2">
							<Checkbox id={`persistNwcToDB=${nwcWallet?.id}`} name="persist-nwc-locally" bind:checked={persistNwcToDB} />
							<p>Store wallet on server.</p>
						</div>
					</div>
					{#if nwcWallet}
						<Button on:click={handleDelete} size="icon" variant="ghost" class="text-destructive border-0">
							<span class="i-tdesign-delete-1 w-4 h-4" />
						</Button>
					{/if}
				</div>
			</div>
		</form>
	</Collapsible.Content>
</Collapsible.Root>
