<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { deleteProductMutation, setProductFeaturedMutation } from '$lib/fetch/products.mutations'
	import { deleteStallMutation, setStallFeaturedMutation } from '$lib/fetch/stalls.mutations'
	import { userDeleteAccountMutation } from '$lib/fetch/users.mutations'
	import { currentUserRole } from '$lib/ndkLogin'
	import { toast } from 'svelte-sonner'

	export let type: 'user' | 'stall' | 'product'
	export let id: string
	export let isFeatured: boolean = false

	$: userRole = $currentUserRole ?? 'pleb'

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
				await $setStallFeaturedMutation.mutateAsync({ stallId: id, featured: true })
				break
			case 'product':
				await $setProductFeaturedMutation.mutateAsync({ productId: id, featured: true })
				break
		}
		toast.success(`${type} featured successfully`)
	}

	const handleUnfeature = async () => {
		switch (type) {
			case 'stall':
				await $setStallFeaturedMutation.mutateAsync({ stallId: id, featured: false })
				break
			case 'product':
				await $setProductFeaturedMutation.mutateAsync({ productId: id, featured: false })
				break
		}
		toast.success(`${type} unfeatured successfully`)
	}
</script>

{#if userRole !== 'pleb'}
	<div class="flex gap-2">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" builders={[builder]}>
					{@const capitalizedType = userRole.charAt(0).toUpperCase() + userRole.slice(1)}
					{capitalizedType} Actions
					<span class="i-mdi-chevron-down ml-2" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
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

					<DropdownMenu.Item class="text-red-500" on:click={handleDelete}>
						Delete {type}
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{/if}
