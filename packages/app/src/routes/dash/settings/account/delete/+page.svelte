<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import { userDeleteAccountMutation } from '$lib/fetch/users.mutations'
	import ndkStore from '$lib/stores/ndk'

	let challengeSolved = false

	const handleDeleteAccount = async () => {
		$userDeleteAccountMutation.mutate($ndkStore?.activeUser?.pubkey)
	}

	const handleChallengeInputChange = (input: string) => {
		if (input === 'DELETE') {
			challengeSolved = true
		} else {
			challengeSolved = false
		}
	}
</script>

<div class="pb-4 space-y-2">
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-4">
			<p class="text-lg">Are you sure you want to delete your account?</p>
			<p class="text-sm">This action is irreversible and will delete all your data.</p>
			<p class="text-sm">Please type <strong>DELETE</strong> to confirm</p>
			<div class="flex flex-col gap-4">
				<Input id="accountDeletionChallenge" type="text" on:input={(e) => handleChallengeInputChange(e.target?.value)} />
				<Button
					variant="destructive"
					id="executeDeletion"
					disabled={!challengeSolved}
					class="w-full font-bold"
					on:click={handleDeleteAccount}>Delete account</Button
				>
			</div>
		</div>
	</div>
</div>
