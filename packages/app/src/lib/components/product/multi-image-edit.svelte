<script lang="ts">
	import { queryClient } from '$lib/fetch/client'
	import { editProductImageMutation } from '$lib/fetch/productImages.mutations'
	import ndkStore from '$lib/stores/ndk'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { ProductImage } from '@plebeian/database'

	import EditableImage from '../settings/editable-image.svelte'
	import Button from '../ui/button/button.svelte'

	export let images: Partial<ProductImage>[] = []

	const dispatch = createEventDispatcher()

	const invalidateProductsQuery = () => {
		queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser?.pubkey] })
	}

	const handleSetMainImage = async (productId: string, imageUrl: string) => {
		await $editProductImageMutation.mutateAsync({ productId, imageUrl, imageOrder: 0 })
		invalidateProductsQuery()
		toast.success('New image set as main image!')
	}

	const handleImageAdd = async (imageUrl: string) => {
		dispatch('imageAdded', imageUrl)
	}

	const handleImageRemove = async (imageUrl: string) => {
		dispatch('imageRemoved', imageUrl)
	}

	const handleSwapImageForNew = async (oldImageUrl: string, newImageUrl: string) => {
		handleImageRemove(oldImageUrl)
		handleImageAdd(newImageUrl)
	}

	$: images = images.sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))
</script>

<div class="grid grid-cols-2 gap-4">
	{#each images as image}
		{#if image.imageUrl}
			<div class="flex flex-col">
				<EditableImage marketContext={true} src={image.imageUrl} on:save={(e) => handleSwapImageForNew(image.imageUrl ?? '', e.detail)} />
				<div class="border-r-2 border-b-2 border-l-2 border-black text-center">
					<Button
						on:click={() => handleSetMainImage(image.productId ?? '', image.imageUrl ?? '')}
						size="icon"
						variant="ghost"
						class="border-0"
					>
						{#if image.imageOrder === 0}
							<span class="i-mdi-star text-primary w-4 h-4" />
						{:else}
							<span class="i-mdi-star-outline w-4 h-4 cursor-pointer" />
						{/if}
					</Button>
					<Button on:click={() => handleImageRemove(image.imageUrl ?? '')} size="icon" variant="ghost" class=" text-destructive border-0"
						><span class="i-tdesign-delete-1 w-4 h-4"></span></Button
					>
				</div>
			</div>
		{/if}
	{/each}

	<EditableImage marketContext={true} src={null} on:save={(e) => handleImageAdd(e.detail)} />
</div>
