<script lang="ts">
	import { queryClient } from '$lib/fetch/client'
	import { addProductImageMutation, editProductImageMutation, removeProductImageMutation } from '$lib/fetch/productImages.mutations'
	import ndkStore from '$lib/stores/ndk'
	import { createEventDispatcher } from 'svelte'

	import type { ProductImage } from '@plebeian/database'

	import EditableImage from '../settings/editable-image.svelte'
	import Button from '../ui/button/button.svelte'

	export let images: Partial<ProductImage>[] = []
	export let productId: string | undefined

	const dispatch = createEventDispatcher()

	const invalidateProductsQuery = () => {
		queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser.pubkey] })
	}

	const handleSetMainImage = async (productId: string, imageUrl: string) => {
		await $editProductImageMutation.mutateAsync({ productId, imageUrl, imageOrder: 0 })
		invalidateProductsQuery()
	}

	const handleSetNewUrl = async (productId: string, imageUrl: string, newImageUrl: string) => {
		await $editProductImageMutation.mutateAsync({ productId, imageUrl, newImageUrl })
		invalidateProductsQuery()
	}

	const handleImageAdd = async (event: CustomEvent) => {
		if (!productId) {
			dispatch('imageAdded', event.detail)
		} else {
			await $addProductImageMutation.mutateAsync({
				productId: productId,
				imageUrl: event.detail,
				imageType: 'gallery',
			})
			invalidateProductsQuery()
		}
	}

	const handleImageRemove = async (productId: string, imageUrl: string) => {
		await $removeProductImageMutation.mutateAsync({ productId, imageUrl })
	}
</script>

<div class="grid grid-cols-2 gap-4">
	{#each images as image}
		{#if image.imageUrl}
			<div class="flex flex-col">
				<EditableImage
					marketKontext={true}
					src={image.imageUrl}
					on:save={(e) => handleSetNewUrl(image.productId ?? '', image.imageUrl ?? '', e.detail)}
				/>
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
					<Button
						on:click={() => handleImageRemove(image.productId ?? '', image.imageUrl ?? '')}
						size="icon"
						variant="ghost"
						class=" text-destructive border-0"><span class="i-tdesign-delete-1 w-4 h-4"></span></Button
					>
				</div>
			</div>
		{/if}
	{/each}

	<EditableImage marketKontext={true} src={null} on:save={(e) => handleImageAdd(e)} />
</div>
