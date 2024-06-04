<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query'
	import { goto } from '$app/navigation'
	import { DELETEUser } from '$lib/apiUtils'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import ndkStore from '$lib/stores/ndk'
	import { deleteAccount } from '$lib/stores/session'

	export let userName = $ndkStore.activeUser?.profile?.name || $ndkStore.activeUser?.profile?.displayName
	export let intentToDelete = false
	let challengeSolved = false

	$: deleteAccountMutation = createMutation({
		mutationFn: async () => {
			const ndkUser = $ndkStore.getUser({
				hexpubkey: $ndkStore.activeUser?.pubkey,
			})

			if ($ndkStore.activeUser?.pubkey) {
				const res = await DELETEUser(ndkUser.pubkey).then((res) => res.json())
				console.log('DELETEUser', res)
				return res
			}
			return null
		},
		onSuccess: (data) => {
			deleteAccount($ndkStore.activeUser?.pubkey ? $ndkStore.activeUser?.pubkey : '')
			delete $ndkStore.signer
			goto('/')
		},
	})

	const handleDeleteAccount = async () => {
		await $deleteAccountMutation.mutate()
	}

	const handleChallangeInputChange = (input: string) => {
		if (input === userName) {
			challengeSolved = true
		} else {
			challengeSolved = false
		}
	}
</script>

<div class="flex flex-col gap-4">
	{#if intentToDelete}
		<div class="flex flex-col gap-4">
			<p class="text-lg">Are you sure you want to delete your account?</p>
			<p class="text-sm">This action is irreversible and will delete all your data.</p>
			<p class="text-sm">Please type your username <b>{userName}</b> to confirm.</p>
			<div class="flex flex-col gap-4">
				<Input id="accountDeletionChallange" type="password" on:input={(e) => handleChallangeInputChange(e.target?.value)} />
				<Button id="executeDeletion" disabled={!challengeSolved} class="w-full font-bold bg-destructive" on:click={handleDeleteAccount}
					>Delete account</Button
				>
			</div>
		</div>
	{:else}
		<Button id="deletionIntent" class="w-full font-bold bg-destructive" on:click={() => (intentToDelete = true)}>Delete account</Button>
	{/if}
</div>
