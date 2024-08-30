<script lang="ts">
	import type { DisplayWallet, NWCWallet } from '$lib/server/wallet.service'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label/index.js'
	import { deleteWalletMutation, persistWalletMutation, updateWalletMutation } from '$lib/fetch/wallets.mutations'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import { Checkbox } from '../ui/checkbox'

	export let nwcWallet: DisplayWallet | undefined
	let showSecret = false
	let persistNwcLocally: boolean

	onMount(() => {
		persistNwcLocally = Boolean(nwcWallet && nwcWallet.id === 'local')
	})

	const onSubmit = async (event: SubmitEvent) => {
		const formData = new FormData(event.currentTarget as HTMLFormElement) as FormData
		const wallet: NWCWallet = {
			walletPubKey: formData.get('nwc-pubkey') as string,
			walletRelay: formData.get('nwc-relay') as string,
			walletSecret: formData.get('nwc-secret') as string,
		}

		if (persistNwcLocally) {
			await persistWalletLocalOnly(wallet)
			toast.success('Wallet saved locally')
		} else {
			if (nwcWallet) {
				await updateWallet(wallet)
				toast.success('Wallet updated')
			} else {
				await persistWallet(wallet)
				toast.success('Wallet saved')
			}
		}
	}

	const persistWallet = async (wallet: NWCWallet) => {
		await $persistWalletMutation.mutateAsync({
			walletType: 'nwc',
			walletDetails: wallet,
		})
		toast.success('Wallet saved')
	}

	const updateWallet = async (wallet: NWCWallet) => {
		if (!nwcWallet) return
		await $updateWalletMutation.mutateAsync({
			walletId: nwcWallet.id,
			walletDetails: {
				walletType: 'nwc',
				walletDetails: wallet,
			},
		})
		toast.success('Wallet updated')
	}

	const persistWalletLocalOnly = async (wallet: NWCWallet) => {
		localStorage.setItem('nwc-wallet', JSON.stringify(wallet))
	}

	const handleDelete = () => {
		if (!nwcWallet) return
		if (nwcWallet.id === 'local') {
			localStorage.removeItem('nwc-wallet')
			resetForm()
			toast.success('NWC Wallet deleted locally')
		} else {
			$deleteWalletMutation.mutateAsync(nwcWallet.id)
			toast.success('NWC Wallet deleted')
		}
	}

	const resetForm = () => {
		const form = document.querySelector('form')
		if (form) {
			form.reset()
		}
	}
</script>

<form on:submit|preventDefault={onSubmit}>
	<div class="pb-4 space-y-2">
		<h3 class="text-lg font-bold">Wallet Connect</h3>

		<div class="grid w-full items-center gap-1.5">
			<Label for="nwc-pubkey" class="font-bold">Wallet connect pubkey</Label>
			<Input value={nwcWallet?.walletDetails.walletPubKey} type="text" id="nwc-pubkey" name="nwc-pubkey" />
		</div>

		<div class="grid w-full items-center gap-1.5">
			<Label for="nwc-relay" class="font-bold">Wallet connect relay</Label>
			<Input value={nwcWallet?.walletDetails.walletRelay} type="url" id="nwc-relay" name="nwc-relay" />
		</div>
		<div class="grid w-full items-center gap-1.5">
			<Label for="nwc-secret" class="font-bold">Wallet connect secret</Label>
			<div class="flex flex-row">
				<Input value={nwcWallet?.walletDetails.walletSecret} type={showSecret ? 'text' : 'password'} id="nwc-secret" name="nwc-secret" />
				<Button on:click={() => (showSecret = !showSecret)} size="icon" variant="ghost" class="text-destructive border-0">
					{#if showSecret}
						<span class="i-mdi-eye-outline w-4 h-4" />
					{:else}
						<span class="i-mdi-eye-off-outline w-4 h-4" />
					{/if}
				</Button>
			</div>
		</div>

		<div class="grid w-full items-center gap-1.5">
			<Label for="persist-nwc-locally" class="font-bold">Persist NWC only locally</Label>
			<div class="flex items-center gap-2">
				<Checkbox id="persist-nwc-locally" name="persist-nwc-locally" bind:checked={persistNwcLocally} />
				<p>Store NWC details ONLY in your browser's local storage.</p>
			</div>
		</div>
		<div class="flex flex-row gap-2">
			<Button id="userDataSubmit" class="w-full font-bold" type="submit">
				{nwcWallet ? 'Update' : 'Save'} Wallet
			</Button>
			{#if nwcWallet}
				<Button on:click={handleDelete} size="icon" variant="ghost" class="text-destructive border-0">
					<span class="i-tdesign-delete-1 w-4 h-4" />
				</Button>
			{/if}
		</div>
	</div>
</form>
