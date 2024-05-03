<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'

	export let item: RichStall
</script>

<Card.Root class="flex h-[34vh] cursor-pointer flex-col gap-4 border-4 border-black bg-transparent text-black">
	<Card.Header class="flex flex-col justify-between">
		<span class="truncate text-2xl font-bold">{item.name}</span>
		<span class="font-red font-bold">Since: {item.createDate}</span>
	</Card.Header>
	<Card.Content class="max-h-[33%] flex-grow overflow-hidden">{item.description}</Card.Content>

	<Card.Footer class="flex flex-col items-start font-bold">
		<span>Owner: {item.userName}</span>
		<span>Currency: {item.currency}</span>
		<span>{item.productCount} products and {item.orderCount} orders</span>
	</Card.Footer>
</Card.Root>
