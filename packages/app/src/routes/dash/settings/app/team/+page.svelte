<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import { page } from '$app/stores'
	import MiniUser from '$lib/components/cart/mini-user.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import ProfileSearch from '$lib/components/users/profile-search.svelte'
	import { createUserFromNostrMutation, setUserRoleMutation } from '$lib/fetch/users.mutations.js'
	import { createUserByIdQuery, createUsersByFilterQuery } from '$lib/fetch/users.queries.js'
	import ndkStore from '$lib/stores/ndk'
	import { decodePk } from '$lib/utils'
	import { toast } from 'svelte-sonner'

	import type { UserRoles } from '@plebeian/database/constants'

	import type { PageData } from '../$types.js'

	export let data: PageData
	const linkDetails = data.menuItems.find((item) => item.value === 'app-settings')?.links.find((item) => item.href === $page.url.pathname)

	const admins = createUsersByFilterQuery({ role: 'admin' })
	const editors = createUsersByFilterQuery({ role: 'editor' })
	const plebs = createUsersByFilterQuery({ role: 'pleb' })

	let isAddUserOpen = false
	let npub = ''
	let newUserProfile: NDKUserProfile | null = null

	$: userProfileQuery = npub ? createUserByIdQuery(decodePk(npub)) : null
	$: {
		if ($userProfileQuery?.data) {
			newUserProfile = $userProfileQuery.data
		}
	}

	function resetForm() {
		npub = ''
		newUserProfile = null
		isAddUserOpen = false
	}

	async function handleSetUserRole(userId: string, role: UserRoles) {
		await $setUserRoleMutation.mutateAsync({ userId, role })
		toast.success('User role updated successfully!')
	}

	async function handleAddNostrUser(role: UserRoles, npub: string) {
		const pkFromNpub = decodePk(npub)
		if (!pkFromNpub || !newUserProfile) {
			toast.error('Invalid npub')
			return
		}
		try {
			await $createUserFromNostrMutation.mutateAsync({ pubkey: pkFromNpub, profile: newUserProfile })
			await $setUserRoleMutation.mutateAsync({ userId: pkFromNpub, role })
			resetForm()
			toast.success('User added successfully!')
		} catch (e) {
			toast.error(`Failed to add user`)
		}
	}
</script>

<div class="pb-4 space-y-2 max-w-2xl">
	<Collapsible.Root class="border-black border p-2 bg-white" bind:open={isAddUserOpen}>
		<Collapsible.Trigger class="flex flex-row w-full items-center justify-between gap-2 mr-4">
			Add User by npub
			<span class="i-mdi-plus w-6 h-6" />
		</Collapsible.Trigger>
		<Collapsible.Content>
			<div class="mt-4 space-y-4">
				{#if npub}
					<MiniUser userId={decodePk(npub)} mode="compact" />
				{:else}
					<ProfileSearch
						on:select={({ detail }) => {
							npub = detail.npub
						}}
					/>
				{/if}

				<div class="flex justify-end space-x-2">
					<Button variant="outline" on:click={resetForm}>Cancel</Button>
					<Button variant="primary" on:click={() => handleAddNostrUser('admin', npub)}>Set as Admin</Button>
					<Button variant="primary" on:click={() => handleAddNostrUser('editor', npub)}>Set as Editor</Button>
				</div>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>

	{#if $admins.data}
		<h3 class="text-lg font-bold">Admins</h3>
		{#each $admins.data as userId}
			<div class="flex flex-row items-center justify-between border rounded-md p-2 bg-white">
				<MiniUser {userId} />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						{#if $ndkStore.activeUser?.pubkey === userId}
							<Button variant="outline" data-tooltip="You can not demote yourself" builders={[builder]} disabled>Change Role</Button>
						{:else}
							<Button variant="outline" builders={[builder]}>
								Change Role
								<span class="i-mdi-chevron-down ml-2" />
							</Button>
						{/if}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item on:click={() => handleSetUserRole(userId, 'editor')}>Make Editor</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => handleSetUserRole(userId, 'pleb')}>Make Pleb</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		{/each}
	{/if}

	{#if $editors.data}
		<h3 class="text-lg font-bold">Editors</h3>
		{#each $editors.data as userId}
			<div class="flex flex-row items-center justify-between border rounded-md p-2 bg-white">
				<MiniUser {userId} />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button variant="outline" builders={[builder]}>
							Change Role
							<span class="i-mdi-chevron-down ml-2" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item on:click={() => handleSetUserRole(userId, 'admin')}>Make Admin</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => handleSetUserRole(userId, 'pleb')}>Make Pleb</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		{/each}
	{/if}

	{#if $plebs.data}
		<h3 class="text-lg font-bold">Plebs</h3>
		{#each $plebs.data as userId}
			<div class="flex flex-row items-center justify-between border rounded-md p-2 bg-white">
				<MiniUser {userId} />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button variant="outline" builders={[builder]}>
							Change Role
							<span class="i-mdi-chevron-down ml-2" />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item on:click={() => handleSetUserRole(userId, 'admin')}>Make Admin</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => handleSetUserRole(userId, 'editor')}>Make Editor</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		{/each}
	{/if}
</div>
