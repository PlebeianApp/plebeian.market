<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { RichUser } from '$lib/server/users.service'
	import { page } from '$app/stores'
	import SingleImage from '$lib/components/settings/editable-image.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { userDataMutation } from '$lib/fetch/users.mutations'
	import ndkStore from '$lib/stores/ndk'
	import { nav_back } from '$lib/utils'
	import { toast } from 'svelte-sonner'

	import type { PageData } from './$types'
	import { userEventSchema } from '../../../../schema/nostr-events'

	export let data: PageData
	$: ({ activeUser, userExist } = data)

	$: editingActiveUser = activeUser ?? ({} as RichUser)

	interface FormDataWithEntries extends FormData {
		entries(): IterableIterator<[string, string]>
	}

	const handleSubmit = async (event: SubmitEvent) => {
		const formData = new FormData(event.currentTarget as HTMLFormElement) as FormDataWithEntries
		const formObject = Object.fromEntries(formData.entries())

		activeUser?.id && (formObject.id = activeUser.id)
		formObject.banner = editingActiveUser.banner ?? ''
		formObject.image = editingActiveUser.image ?? ''

		const ndkUser = $ndkStore.getUser({
			pubkey: $ndkStore.activeUser?.pubkey,
		})
		const { data: filteredProfile } = userEventSchema.strip().safeParse(formObject)
		filteredProfile?.id && delete (filteredProfile as NDKUserProfile).id
		ndkUser.profile = filteredProfile as NDKUserProfile
		if (userExist && filteredProfile) {
			try {
				const res = await $userDataMutation.mutateAsync(filteredProfile)
				// await ndkUser.publish().then((data) => console.log(data))
				toast.success('User data updated')
			} catch (error) {
				console.error(error)
				toast.error('Failed to update user data')
			}
		}
	}

	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)

	const handleSaveBannerImage = (event: CustomEvent) => {
		editingActiveUser.banner = event.detail
	}

	const handleSaveProfileImage = (event: CustomEvent) => {
		editingActiveUser.image = event.detail
	}
</script>

{#if activeUser}
	<form on:submit|preventDefault={handleSubmit}>
		<div class="pb-4 space-y-2">
			<div class="flex items-center gap-1">
				<Button size="icon" variant="outline" class="border-none" on:click={() => nav_back()}>
					<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
				</Button>
				<section>
					<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
					<p class="text-gray-600">{linkDetails?.description}</p>
				</section>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="userImage" class="font-bold">Banner image</Label>
				<SingleImage src={editingActiveUser?.banner ?? null} on:save={handleSaveBannerImage} />
			</div>

			<div class="grid items-center gap-1.5 w-28">
				<Label for="userImage" class="font-bold">Profile image</Label>
				<SingleImage src={editingActiveUser?.image ?? null} on:save={handleSaveProfileImage} />
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="name" class="font-bold">Name</Label>
				<Input value={activeUser?.name} type="text" id="name" name="name" placeholder={editingActiveUser?.name} />
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
				<Label for="nip05" class="font-bold">Nostr address</Label>
				<Input value={activeUser?.nip05} type="text" id="nip05" name="nip05" placeholder={editingActiveUser?.nip05} />
			</div>

			<Button id="userDataSubmit" class="w-full font-bold" type="submit">Save</Button>
		</div>
	</form>
{/if}
