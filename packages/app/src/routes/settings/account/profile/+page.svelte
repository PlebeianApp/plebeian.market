<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { RichUser } from '$lib/server/users.service'
	import type { Selected } from 'bits-ui'
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query'
	import { page } from '$app/stores'
	import { createToken, GETUserFromId, PUTUser } from '$lib/apiUtils'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import ndkStore from '$lib/stores/ndk'
	import { nav_back } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from './$types'

	const queryClient = useQueryClient()
	let token: string
	export let data: PageData
	const { userTrustLevels } = data

	let userTrustLevel: Selected<string> | undefined = undefined

	$: userQuery = createQuery<RichUser>({
		queryKey: ['user', !!$ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			const userData = await GETUserFromId($ndkStore.activeUser?.pubkey ?? '', token).then((res) => res.json())
			const user: RichUser = userData[0]
			return user
		},
		enabled: !!token,
	})

	$: userData = $userQuery.data ?? {
		nip05: '',
		about: '',
		displayName: '',
		name: '',
		image: '',
		lud16: '',
	}

	const userDataMutation = createMutation({
		mutationFn: async () => {
			const ndkUser = $ndkStore.getUser({
				hexpubkey: $ndkStore.activeUser?.pubkey,
			})

			ndkUser.profile = {
				...userData,
			} as NDKUserProfile

			const res = await PUTUser(ndkUser).then((res) => res.json())
			await ndkUser.publish()
			return res
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['user', !!$ndkStore.activeUser?.pubkey] })
			queryClient.setQueryData(['user', !!$ndkStore.activeUser?.pubkey], data)
		},
	})

	const handleUserDataSubmit = async () => {
		$userDataMutation.mutate()
	}
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)

	onMount(async () => {
		token = await createToken(window.location.href, 'GET')
		if (!userTrustLevel) {
			userTrustLevel = {
				value: $userQuery.data?.trustLevel ?? '',
				label: $userQuery.data?.trustLevel ?? '',
			}
		}
	})
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
	<div>
		<div class="grid w-full items-center gap-1.5">
			<Label for="userImage" class="font-bold">Profile image</Label>
			<Input bind:value={userData.image} type="image" id="userImage" src={userData.image} />
		</div>

		<div class="grid w-full items-center gap-1.5">
			<Label for="name" class="font-bold">Name</Label>
			<Input bind:value={userData.name} type="text" id="name" placeholder={userData.name} />
		</div>

		<div class="grid w-full items-center gap-1.5">
			<Label for="name" class="font-bold">Display Name</Label>
			<Input bind:value={userData.displayName} type="text" id="displayName" placeholder={userData.displayName} />
		</div>

		<div class="grid w-full items-center gap-1.5">
			<Label for="about" class="font-bold">Short bio</Label>
			<Textarea bind:value={userData.about} rows={8} id="about" placeholder={userData.about} />
		</div>

		<div class="grid w-full items-center gap-1.5">
			<Label for="nip05" class="font-bold">Nostr address</Label>
			<Input bind:value={userData.nip05} type="text" id="nip05" placeholder={userData.nip05} />
		</div>

		<div class="flex-grow">
			<Label class="truncate font-bold">Trust level</Label>
			<Select bind:selected={userTrustLevel} name="trustLevel">
				<SelectTrigger class="border-black border-2">
					<SelectValue placeholder={userTrustLevel?.label} />
				</SelectTrigger>
				<SelectContent class="border-black border-2 max-h-[350px] overflow-y-auto">
					{#each userTrustLevels as trustLevel}
						<SelectItem value={trustLevel}>{trustLevel}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>

		<Button id="userDataSubmit" class="w-full font-bold" on:click={handleUserDataSubmit}>Save</Button>
	</div>
</div>
