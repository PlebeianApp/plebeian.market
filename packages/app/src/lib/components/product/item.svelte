<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js'
	export let productName: string = 'Polaroid Pronto 600'
	export let price: string = '$15 USD'
	export let sats: string = '54k sats'
	export let imageUrl: string =
		'https://searxng.ca/image_proxy?url=https%3A%2F%2Fwww.gearpatrol.com%2Fwp-content%2Fuploads%2Fsites%2F2%2F2023%2F09%2Fbest-vintage-film-cameras-refresh-lead-650de2dd54d04-jpg.webp&h=1367be0e2d2f2e23da02bc653c0fcd4867a26a8e426e32a8eb5bc7f9eb21ddb3'
</script>

<Card.Root class="cursor-pointer border-4 border-black bg-transparent text-black text-black">
	<img class="contain h-[329px] object-cover" src={imageUrl} alt="" />
	<Card.Footer class="flex items-start justify-between p-4">
		<span class="truncate font-bold">{productName}</span>
		<div class="flex flex-col text-right">
			<span class="font-red font-bold">{sats}</span>
			<span class="text-sm">{price}</span>
		</div>
	</Card.Footer>
</Card.Root>
