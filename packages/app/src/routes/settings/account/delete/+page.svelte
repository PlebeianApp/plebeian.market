<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { DELETEUser } from '$lib/apiUtils'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import ndkStore from '$lib/stores/ndk'
	import { deleteAccount } from '$lib/stores/session'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	let challengeSolved = false

	export let data: PageData
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)

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
		$deleteAccountMutation.mutate()
	}

	const handleChallangeInputChange = (input: string) => {
		if (input === 'DELETE') {
			challengeSolved = true
		} else {
			challengeSolved = false
		}
	}
</script>

<div class="pb-4 space-y-2">
	<div class=" flex items-center gap-1">
		<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</Button>
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-gray-600">{linkDetails?.description}</p>
		</section>
	</div>
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-4">
			<p class="text-lg">Are you sure you want to delete your account?</p>
			<p class="text-sm">This action is irreversible and will delete all your data.</p>
			<p class="text-sm">Please type <strong>DELETE</strong> to confirm</p>
			<div class="flex flex-col gap-4">
				<Input id="accountDeletionChallange" type="password" on:input={(e) => handleChallangeInputChange(e.target?.value)} />
				<Button id="executeDeletion" disabled={!challengeSolved} class="w-full font-bold bg-destructive" on:click={handleDeleteAccount}
					>Delete account</Button
				>
			</div>
		</div>
	</div>
</div>
