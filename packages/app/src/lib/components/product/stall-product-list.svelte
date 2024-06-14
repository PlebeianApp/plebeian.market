<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import { createProductsByFilterQuery } from '$lib/fetch/products.queries'

	import Spinner from '../assets/spinner.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import ImgPlaceHolder from './imgPlaceHolder.svelte'

	export let stall: RichStall

	$: productsByStall = createProductsByFilterQuery({
		stallId: stall.id,
	})
</script>

<div>
	{#if $productsByStall.isLoading}
		<Spinner />
	{:else if $productsByStall.data}
		{#each $productsByStall.data as product}
			<a class="flex flex-row justify-between my-4 gap-2" href="/products/{product.id}">
				{#if product.galleryImages[0]}
					<img class="contain h-[60px] aspect-square object-cover" src={product.galleryImages[0]} alt="" />
				{:else}
					<ImgPlaceHolder imageType={'mini'} />
				{/if}
				<div class="flex flex-col flex-grow justify-between">
					<div>{product.name}</div>
					<div class="max-w-[300px] whitespace-nowrap overflow-hidden text-ellipsis">{product.description}</div>
				</div>
				<div class="flex flex-col justify-between">
					<div>{product.price}</div>
					<div>{product.price}</div>
				</div>
			</a>
			<Separator />
		{/each}
	{/if}
</div>
