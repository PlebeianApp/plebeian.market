<script lang="ts">
	import { productImagesForUserQuery } from '$lib/fetch/productImages.queries'
	import { createEventDispatcher } from 'svelte'

	import Spinner from '../assets/spinner.svelte'

	const dispatch = createEventDispatcher()

	const handleImageClick = (imageUrl: string) => {
		dispatch('imageClick', imageUrl)
	}

	const handleKeyPress = (event: KeyboardEvent, imageUrl: string) => {
		if (event.key === 'Enter' || event.key === ' ') {
			handleImageClick(imageUrl)
		}
	}
</script>

<div class="grid grid-cols-3 gap-1">
	{#if $productImagesForUserQuery.isLoading}
		<Spinner />
	{:else if $productImagesForUserQuery.data}
		{#each $productImagesForUserQuery.data as image}
			<button
				on:click={() => handleImageClick(image.imageUrl)}
				on:keypress={(event) => handleKeyPress(event, image.imageUrl)}
				type="button"
				class="border-2 border-black"
				tabindex="0"
				aria-label={`Image ${image.imageUrl}`}
			>
				<img src={image.imageUrl} alt={`Image for ${image.imageUrl}`} />
			</button>
		{/each}
	{/if}
</div>
