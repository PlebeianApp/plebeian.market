<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { FormDataWithEntries } from '$lib/interfaces'
	import type { RichUser } from '$lib/server/users.service'
	import SingleImage from '$lib/components/settings/editable-image.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { userDataMutation } from '$lib/fetch/users.mutations'
	import { createUserExistsQuery } from '$lib/fetch/users.queries'
	import ndkStore from '$lib/stores/ndk'
	import { userEventSchema } from '$src/schema/nostr-events'
	import { toast } from 'svelte-sonner'

	// FIXME: delete foto doesnt work
	$: userExist = createUserExistsQuery($ndkStore.activeUser?.pubkey ?? '')
	$: editingActiveUser = $ndkStore.activeUser?.profile ?? ({} as RichUser)

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement) as FormDataWithEntries
		const formObject: Record<string, string | undefined> = {}

		for (const [key, value] of formData.entries()) {
			formObject[key] = typeof value === 'string' ? (value.trim() === '' ? undefined : value.trim()) : undefined
		}

		if ($ndkStore.activeUser?.pubkey) formObject.id = $ndkStore.activeUser.pubkey
		formObject.banner = editingActiveUser.banner ?? undefined
		formObject.image = editingActiveUser.image ?? undefined

		const ndkUser = $ndkStore.getUser({
			pubkey: $ndkStore.activeUser?.pubkey,
		})

		const parseResult = userEventSchema.safeParse(formObject)

		if (!parseResult.success) {
			console.error(parseResult.error)
			toast.error('Invalid form data')
			return
		}

		const filteredProfile = parseResult.data

		ndkUser.profile = filteredProfile as NDKUserProfile

		if ($userExist?.data?.exists && !$userExist?.data?.banned) {
			try {
				await $userDataMutation.mutateAsync(filteredProfile)
				await ndkUser.publish()
				toast.success('User data updated')
			} catch (error) {
				console.error(error)
				toast.error('Failed to update user data')
			}
		} else {
			await ndkUser.publish()
			toast.success('User data updated')
		}
	}
</script>

{#if $ndkStore.activeUser?.pubkey}
	<form on:submit={handleSubmit}>
		<div class="pb-4 space-y-2">
			<div class="grid w-full items-center gap-1.5">
				<Label for="userImage" class="font-bold">Banner image</Label>
				<SingleImage
					src={editingActiveUser?.banner ?? null}
					index={-1}
					imagesLength={1}
					on:save={({ detail }) => (editingActiveUser.banner = detail.url)}
				/>
			</div>

			<div class="grid items-center gap-1.5 w-48 aspect-square">
				<Label for="userImage" class="font-bold">Profile image</Label>
				<SingleImage
					src={editingActiveUser?.image ?? null}
					index={-1}
					imagesLength={1}
					on:save={({ detail }) => (editingActiveUser.image = detail.url)}
				/>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="name" class="font-bold">Name</Label>
				<Input value={editingActiveUser.name} type="text" id="name" name="name" placeholder={editingActiveUser?.name} />
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="displayName" class="font-bold">Display Name</Label>
				<Input
					value={editingActiveUser?.displayName}
					type="text"
					id="displayName"
					name="displayName"
					placeholder={editingActiveUser?.displayName}
				/>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="about" class="font-bold">Short bio</Label>
				<Textarea value={editingActiveUser?.about} rows={8} id="about" name="about" placeholder={editingActiveUser?.about} />
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="nip05" class="font-bold">Nostr address (NIP05)</Label>
				<Input value={editingActiveUser?.nip05} type="text" id="nip05" name="nip05" placeholder={editingActiveUser?.nip05} />
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="lud16" class="font-bold">Lightning address (LUD16)</Label>
				<Input value={editingActiveUser?.lud16} type="text" id="lud16" name="lud16" placeholder={editingActiveUser?.lud16} />
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="lud06" class="font-bold">LNURL (LUD06)</Label>
				<Input value={editingActiveUser?.lud06} type="text" id="lud06" name="lud06" placeholder={editingActiveUser?.lud06} />
			</div>

			<Button variant="primary" id="userDataSubmit" class="w-full" type="submit">Save</Button>
		</div>
	</form>
{/if}
