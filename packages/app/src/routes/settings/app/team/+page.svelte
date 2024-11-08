<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import { page } from '$app/stores'
	import MiniUser from '$lib/components/cart/mini-user.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input'
	import { createUserFromNostrMutation, setUserRoleMutation } from '$lib/fetch/users.mutations.js'
	import { createUserByIdQuery, createUsersByRoleQuery } from '$lib/fetch/users.queries.js'
	import ndkStore from '$lib/stores/ndk'
	import { decodePk, nav_back } from '$lib/utils'
	import { toast } from 'svelte-sonner'

	import type { UserRoles } from '@plebeian/database/constants'

	import type { PageData } from '../$types.js'

	export let data: PageData
	const linkDetails = data.menuItems.find((item) => item.value === 'app-settings')?.links.find((item) => item.href === $page.url.pathname)

	const admins = createUsersByRoleQuery({ role: 'admin' })
	const editors = createUsersByRoleQuery({ role: 'editor' })
	const plebs = createUsersByRoleQuery({ role: 'pleb' })
	let isAddUserOpen = false
	let npub = ''

	let newUserProfile: NDKUserProfile | null = null

	$: userProfileQuery = npub ? createUserByIdQuery(decodePk(npub)) : null

	$: {
		if ($userProfileQuery?.data) {
			newUserProfile = $userProfileQuery.data
		}
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
		} catch (e) {
			toast.error('Failed to add user')
			return
		}
		isAddUserOpen = false
		npub = ''
		toast.success('User added successfully!')
	}
</script>

<div class="pb-4 space-y-2 max-w-2xl">
	<div>
		<div class=" flex items-center gap-1">
			<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
				<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
			</Button>
			<section>
				<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
				<p class="text-gray-600">{linkDetails?.description}</p>
			</section>
		</div>
	</div>
	<Collapsible.Root class="border-black border p-2" bind:open={isAddUserOpen}>
		<Collapsible.Trigger class="flex flex-row w-full items-center justify-between gap-2 mr-4">
			Add User by npub
			<span class="i-mdi-plus w-6 h-6" />
		</Collapsible.Trigger>
		<Collapsible.Content>
			<div class="mt-4 space-y-4">
				{#if npub}
					{@const pkFromNpub = decodePk(npub)}
					<MiniUser userId={pkFromNpub} />
				{:else}
					<Input bind:value={npub} placeholder="Enter npub" />
				{/if}
				<div class="flex justify-end space-x-2">
					<Button variant="outline" on:click={() => ((npub = ''), (isAddUserOpen = false))}>Cancel</Button>
					<Button on:click={() => handleAddNostrUser('admin', npub)}>Set as Admin</Button>
					<Button on:click={() => handleAddNostrUser('editor', npub)}>Set as Editor</Button>
				</div>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>

	{#if $admins.data}
		<h3 class="text-lg font-bold">Admins</h3>
		{#each $admins.data as userId}
			<div class="flex flex-row items-center justify-between border rounded-md p-2">
				<MiniUser {userId} />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						{#if $ndkStore.activeUser?.pubkey === userId}
							<Button data-tooltip="You can not demote yourself" builders={[builder]} variant="outline" disabled>Change Role</Button>
						{:else}
							<Button builders={[builder]} variant="outline">
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
			<div class="flex flex-row items-center justify-between border rounded-md p-2">
				<MiniUser {userId} />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="outline">
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
			<div class="flex flex-row items-center justify-between border rounded-md p-2">
				<MiniUser {userId} />
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="outline">
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
