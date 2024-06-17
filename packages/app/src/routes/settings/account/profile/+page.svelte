<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { RichUser } from '$lib/server/users.service'
	import type { Selected } from 'bits-ui'
	import { page } from '$app/stores'
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte'
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte'
	import Avatar from '$lib/components/ui/avatar/avatar.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { userDataMutation } from '$lib/fetch/users.mutations'
	import ndkStore from '$lib/stores/ndk'
	import { nav_back } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'
	import { userEventSchema } from '../../../../schema/nostr-events'

	export let data: PageData
	$: ({ userTrustLevels, activeUser } = data)

	let userTrustLevel: Selected<string> = { label: '', value: '' }

	const handleSubmit = async (event: SubmitEvent) => {
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const formObject = Object.fromEntries(formData.entries())

		formObject.trustLevel = userTrustLevel.value
			? userTrustLevel.value
			: activeUser?.data?.trustLevel
				? activeUser?.data.trustLevel
				: userTrustLevels[0]
		const filteredFormObject = Object.fromEntries(Object.entries(formObject).filter(([_, value]) => value !== '')) as unknown as RichUser
		const ndkUser = $ndkStore.getUser({
			hexpubkey: $ndkStore.activeUser?.pubkey,
		})
		ndkUser.profile = userEventSchema.strip().safeParse(activeUser?.data).data as NDKUserProfile
		await $userDataMutation.mutateAsync(filteredFormObject)
		await ndkUser.publish()
	}
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)

	onMount(() => {
		if (!activeUser?.data?.id) {
			activeUser?.refetch()
		}
	})
</script>

{#if activeUser?.data?.id}
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
				<Label for="userImage" class="font-bold">Profile image</Label>
				<Avatar class="w-24 h-auto">
					<AvatarImage src={activeUser?.data?.image} alt="pfp" />
					<AvatarFallback>{activeUser?.data?.name ? activeUser?.data?.name : activeUser?.data?.displayName}</AvatarFallback>
				</Avatar>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="name" class="font-bold">Name</Label>
				<Input value={activeUser?.data.name} type="text" id="name" name="name" placeholder={activeUser?.data?.name} />
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="displayName" class="font-bold">Display Name</Label>
				<Input
					value={activeUser?.data.displayName}
					type="text"
					id="displayName"
					name="displayName"
					placeholder={activeUser?.data?.displayName}
				/>
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="about" class="font-bold">Short bio</Label>
				<Textarea value={activeUser?.data.about} rows={8} id="about" name="about" placeholder={activeUser?.data?.about} />
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="nip05" class="font-bold">Nostr address</Label>
				<Input value={activeUser?.data.nip05} type="text" id="nip05" name="nip05" placeholder={activeUser?.data?.nip05} />
			</div>

			{#if activeUser?.data?.trustLevel}
				<div class="flex-grow">
					<Label class="truncate font-bold">Trust level</Label>
					<Select bind:selected={userTrustLevel} name="trustLevel">
						<SelectTrigger class="border-black border-2">
							<SelectValue placeholder={activeUser?.data?.trustLevel} />
						</SelectTrigger>
						<SelectContent class="border-black border-2 max-h-[350px] overflow-y-auto">
							{#each userTrustLevels as trustLevel}
								<SelectItem value={trustLevel}>{trustLevel}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
			{/if}
			<Button id="userDataSubmit" class="w-full font-bold" type="submit">Save</Button>
		</div>
	</form>
{/if}
