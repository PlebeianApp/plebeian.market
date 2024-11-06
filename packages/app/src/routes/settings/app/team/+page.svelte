<script lang="ts">
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import MiniUser from '$lib/components/cart/mini-user.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input'
	import { addForbiddenWordMutation, deleteForbiddenWordMutation } from '$lib/fetch/settingsMeta.mutations.js'
	import { setUserRoleMutation } from '$lib/fetch/users.mutations.js'
	import { createUsersByRoleQuery } from '$lib/fetch/users.queries.js'
	import ndkStore from '$lib/stores/ndk'
	import { nav_back } from '$lib/utils'
	import { toast } from 'svelte-sonner'

	import type { PageData } from './$types.js'

	let newWord = ''
	export let data
	const linkDetails = data.menuItems.find((item) => item.value === 'app-settings')?.links.find((item) => item.href === $page.url.pathname)

	const admins = createUsersByRoleQuery({ role: 'admin' })
	const editors = createUsersByRoleQuery({ role: 'editor' })
	const plebs = createUsersByRoleQuery({ role: 'pleb' })

	let isCollapsibleOpen = false

	async function handleSetUserRole(userId: string, role: string) {
		await $setUserRoleMutation.mutateAsync({ userId, role })
		toast.success('User role updated successfully!')
	}

	async function handleAddWord() {
		if (newWord.trim()) {
			try {
				await $addForbiddenWordMutation.mutateAsync(newWord.trim())

				toast.success('Word added to blacklist successfully!')
				newWord = ''
				await invalidateAll()
				isCollapsibleOpen = false
			} catch (error) {
				console.error('Failed to add word to blacklist', error)
				toast.error('Failed to add word to blacklist')
			}
		}
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
