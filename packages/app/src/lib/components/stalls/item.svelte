<script lang="ts">
	import * as Card from '$lib/components/ui/card/index'
	import type {RichStall} from '$lib/server/stalls.service'

	export let item: RichStall
</script>

<Card.Root class="cursor-pointer border-4 border-black bg-transparent text-black">
	<Card.Header class="flex flex-col justify-between">
		<span class="truncate text-2xl font-bold">{item.name}</span>
		<span class="font-red font-bold">Since: {item.createDate}</span>
	</Card.Header>
	<Card.Content>{item.description}</Card.Content>

	<Card.Footer class="flex flex-col items-start font-bold">
		<span>Owner: {item.userName}</span>
		<span>Currency: {item.currency}</span>
		<span>{item.productCount} products and {item.orderCount} orders</span>
	</Card.Footer>
</Card.Root>
