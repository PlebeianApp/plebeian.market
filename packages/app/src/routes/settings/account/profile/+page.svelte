<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { FormDataWithEntries } from '$lib/interfaces'
	import type { RichUser } from '$lib/server/users.service'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import SingleImage from '$lib/components/settings/editable-image.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { userDataMutation } from '$lib/fetch/users.mutations'
	import { createUserExistsQuery } from '$lib/fetch/users.queries'
	import ndkStore from '$lib/stores/ndk'
	import { toast } from 'svelte-sonner'

	import type { PageData } from './$types'
	import { userEventSchema } from '../../../../schema/nostr-events'

	export let data: PageData

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

	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)

	const handleSaveImage = (field: 'banner' | 'image') => (event: CustomEvent) => {
		editingActiveUser[field] = event.detail
	}
</script>

{#if $ndkStore.activeUser?.pubkey}
	<form on:submit={handleSubmit}>
		<div class="pb-4 space-y-2">
			<div class="flex items-center gap-1">
				<Button size="icon" variant="outline" class="border-none" on:click={() => goto('/settings/account')}>
					<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
				</Button>
				<section>
					<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
					<p class="text-gray-600">{linkDetails?.description}</p>
				</section>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="userImage" class="font-bold">Banner image</Label>
				<SingleImage src={editingActiveUser?.banner ?? null} on:save={handleSaveImage('banner')} />
			</div>

			<div class="grid items-center gap-1.5 w-28">
				<Label for="userImage" class="font-bold">Profile image</Label>
				<SingleImage src={editingActiveUser?.image ?? null} on:save={handleSaveImage('image')} />
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

			<Button id="userDataSubmit" class="w-full font-bold" type="submit">Save</Button>
		</div>
	</form>
{/if}
