<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import * as Card from '$lib/components/ui/card/index.js'
	import { currencyToBtc } from '$lib/utils'

	import ImgPlaceHolder from './imgPlaceHolder.svelte'

	export let product: DisplayProduct
	const { galleryImages, name, currency, price, userNip05, identifier, id } = product
</script>

<a href={userNip05 ? `/products/${userNip05}/${identifier}` : `/products/${id}`}>
	<Card.Root class="cursor-pointer border-4 border-black bg-transparent text-black">
		{#if galleryImages}
			<img class="contain h-[329px] object-cover" src={galleryImages[0]} alt="" />
		{:else}
			<ImgPlaceHolder imageType={'thumbnail'} />
		{/if}
		<Card.Footer class="flex items-start justify-between p-4">
			<span class="truncate font-bold">{name}</span>
			<div class="flex flex-col text-right">
				<span class="font-red font-bold">
					{#await currencyToBtc(currency, price, true) then result}
						{result} <small>sats</small>
					{/await}
				</span>
				<span class="text-sm">{price} {currency}</span>
			</div>
		</Card.Footer>
	</Card.Root>
</a>
