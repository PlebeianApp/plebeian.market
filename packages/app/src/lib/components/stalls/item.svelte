<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import * as Card from '$lib/components/ui/card/index'

	export let stall: RichStall
	const { name, createDate, description, userName, currency, productCount, orderCount, userNip05, identifier, id } = stall
</script>

<a href={userNip05 ? `/stalls/${userNip05}/${identifier}` : `/stalls/${id}`}>
	<Card.Root class="flex h-[34vh] cursor-pointer flex-col gap-4 border-4 border-black bg-transparent text-black">
		<Card.Header class="flex flex-col justify-between">
			<span class="truncate text-2xl font-bold">{name}</span>
			<span class="font-red font-bold">Since: {createDate}</span>
		</Card.Header>
		<Card.Content class="max-h-[33%] flex-grow overflow-hidden">{description}</Card.Content>

		<Card.Footer class="flex flex-col items-start font-bold">
			<span>Owner: {userName}</span>
			<span>Currency: {currency}</span>
			<span>{productCount} products</span>
		</Card.Footer>
	</Card.Root>
</a>
