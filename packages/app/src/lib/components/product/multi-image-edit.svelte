<script lang="ts">
	import autoAnimate from '@formkit/auto-animate'
	import { createEventDispatcher } from 'svelte'

	import type { ProductImage } from '@plebeian/database'

	import EditableImage from '../settings/editable-image.svelte'

	export let images: Partial<ProductImage>[] = []

	const dispatch = createEventDispatcher()

	const handleImageAdd = async (imageUrl: string) => {
		dispatch('imageAdded', imageUrl)
	}

	const handleImageRemove = async (imageUrl: string) => {
		dispatch('imageRemoved', imageUrl)
	}

	const handleSwapImageForNew = async (oldImageUrl: string, event: CustomEvent<{ url: string; index: number }>) => {
		const newUrl = event.detail.url
		const index = event.detail.index

		// Create new images array preserving order
		const newImages = [...images]
		const imageToUpdate = newImages.find((img) => img.imageUrl === oldImageUrl)
		if (imageToUpdate) {
			imageToUpdate.imageUrl = newUrl
			// Order is preserved as we're just updating the URL
			dispatch('imagesReordered', newImages)
		}
	}

	const handlePromoteImage = (index: number) => {
		if (index <= 0 || index >= images.length) return

		const newImages = [...images]
		const temp = newImages[index - 1]
		newImages[index - 1] = newImages[index]
		newImages[index] = temp
		newImages[index].imageOrder = index
		newImages[index - 1].imageOrder = index - 1

		dispatch('imagesReordered', newImages)
	}

	const handleDemoteImage = (index: number) => {
		if (index < 0 || index >= images.length - 1) return

		const newImages = [...images]
		const temp = newImages[index + 1]
		newImages[index + 1] = newImages[index]
		newImages[index] = temp
		newImages[index].imageOrder = index
		newImages[index + 1].imageOrder = index + 1

		dispatch('imagesReordered', newImages)
	}
</script>

<div use:autoAnimate class="flex flex-col gap-4">
	{#each images as image, index (image.imageUrl)}
		{#if image.imageUrl}
			<div class="flex flex-col">
				<EditableImage
					src={image.imageUrl}
					{index}
					imagesLength={images.length}
					on:save={(e) => handleSwapImageForNew(image.imageUrl ?? '', e)}
					on:promote={() => handlePromoteImage(index)}
					on:demote={() => handleDemoteImage(index)}
					on:delete={() => handleImageRemove(image.imageUrl ?? '')}
				/>
			</div>
		{/if}
	{/each}

	<EditableImage src={null} index={-1} imagesLength={images.length} on:save={(e) => handleImageAdd(e.detail)} />
</div>
