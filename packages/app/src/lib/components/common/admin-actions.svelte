<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import {
		deleteProductMutation,
		setProductBannedMutation,
		setProductFeaturedMutation,
		setProductUnfeaturedMutation,
	} from '$lib/fetch/products.mutations'
	import {
		deleteStallMutation,
		setStallBannedMutation,
		setStallFeaturedMutation,
		setStallUnfeaturedMutation,
	} from '$lib/fetch/stalls.mutations'
	import { setUserBannedMutation, userDeleteAccountMutation } from '$lib/fetch/users.mutations'
	import { currentUserRole } from '$lib/ndkLogin'
	import { toast } from 'svelte-sonner'

	export let type: 'user' | 'stall' | 'product'
	export let id: string
	export let isFeatured: boolean = false

	$: userRole = $currentUserRole ?? 'pleb'

	const handleBan = async () => {
		try {
			switch (type) {
				case 'stall':
					await $setStallBannedMutation.mutateAsync({ stallId: id, banned: true })
					break
				case 'product':
					await $setProductBannedMutation.mutateAsync({ productId: id, banned: true })
					break
				case 'user':
					await $setUserBannedMutation.mutateAsync({ userId: id, banned: true })
					break
			}
			toast.success(`${type} banned successfully`)
		} catch (error) {
			toast.error(`Failed to ban ${type}`)
		}
	}

	const handleDelete = async () => {
		try {
			switch (type) {
				case 'stall':
					await $deleteStallMutation.mutateAsync(id)
					break
				case 'product':
					await $deleteProductMutation.mutateAsync(id)
					break
				case 'user':
					await $userDeleteAccountMutation.mutateAsync(id)
					break
			}
			toast.success(`${type} deleted successfully`)
		} catch (error) {
			toast.error(`Failed to delete ${type}`)
		}
	}

	const handleFeature = async () => {
		switch (type) {
			case 'stall':
				await $setStallFeaturedMutation.mutateAsync(id)
				break
			case 'product':
				await $setProductFeaturedMutation.mutateAsync(id)
				break
		}
		toast.success(`${type} featured successfully`)
	}

	const handleUnfeature = async () => {
		switch (type) {
			case 'stall':
				await $setStallUnfeaturedMutation.mutateAsync(id)
				break
			case 'product':
				await $setProductUnfeaturedMutation.mutateAsync(id)
				break
		}
		toast.success(`${type} unfeatured successfully`)
	}
</script>

{#if userRole !== 'pleb'}
	<div class="flex gap-2">
		<DropdownMenu.Root>
			<DropdownMenu.TriggerWrapper>
				{@const capitalizedType = userRole.charAt(0).toUpperCase() + userRole.slice(1)}
				{capitalizedType} Actions
			</DropdownMenu.TriggerWrapper>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
					{#if type != 'user'}
						{#if !isFeatured}
							<DropdownMenu.Item on:click={handleFeature}>
								Feature {type}
							</DropdownMenu.Item>
						{:else}
							<DropdownMenu.Item on:click={handleUnfeature}>
								Unfeature {type}
							</DropdownMenu.Item>
						{/if}

						<DropdownMenu.Separator />
					{/if}
					<DropdownMenu.Item class="text-red-500" on:click={handleBan}>
						<span>Ban {type}</span>
						<span
							data-tooltip="This will ban the {type} and all associated items downstream. The {type} will be kept in the database but will not be visible to users."
							class="i-mingcute-question-line w-6 h-6 ml-2"
						/>
					</DropdownMenu.Item>

					<DropdownMenu.Item class="text-red-500" on:click={handleDelete}>
						<span>Delete {type}</span>
						<span
							data-tooltip="This will delete the {type} and all associated items downstream. The {type} will be removed from the database and might be written back when encountered again."
							class="i-mingcute-question-line w-6 h-6 ml-2"
						/>
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
