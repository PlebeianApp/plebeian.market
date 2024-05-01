<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js'
	import { currencyToBtc } from '$lib/utils'
	import ImgPlaceHolder from './imgPlaceHolder.svelte'
	export let productName: string
	export let price: number
	export let currency: string
	export let imageUrl: string | undefined;
</script>

<Card.Root class="cursor-pointer border-4 border-black bg-transparent text-black">
	{#if imageUrl}
		<img class="contain h-[329px] object-cover" src={imageUrl} alt="" />
	{:else}
		<ImgPlaceHolder imageType={"thumbnail"}/>
	{/if}
	<Card.Footer class="flex items-start justify-between p-4">
		<span class="truncate font-bold">{productName}</span>
		<div class="flex flex-col text-right">
			<span class="font-red font-bold">
				{#await currencyToBtc(currency, price, true) then result }
					{result} <small>sats</small>
				{/await}
			</span>
			<span class="text-sm">{price} {currency}</span>
		</div>
	</Card.Footer>
</Card.Root>
