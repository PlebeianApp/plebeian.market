<script>
	import * as Card from '$lib/components/ui/card/index.ts'
	import { Button } from '$lib/components/ui/button/index.ts'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.ts'
	import ProductItem from '$lib/components/product/item.svelte'
	/** @type {import('./$types').PageData} */
	export let data
	const { stalls } = data
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<main class="text-black">
			<div class=" bg-primary px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">Stalls</h2>
					<div class="flex flex-col gap-4">
						{#each stalls as item}
							<a href={`/stalls/${item.id}`}>
								<Card.Root
									class="cursor-pointer border-4 border-black bg-transparent text-black text-black"
								>
									<Card.Header class="flex flex-row justify-between p-4">
										<span class="truncate font-bold">{item.name}</span>
										<span class="font-red font-bold">Listed since: {item.createDate}</span>
									</Card.Header>
									<Card.Content><p>{item.description}</p></Card.Content>

									<Card.Footer class="flex flex-row justify-between p-4">
										<span class="font-red font-bold">Owner: {item.userName}</span>
										<span class="font-red font-bold">Currency: {item.currency}</span>
										<span class="font-red font-bold"
											>{item.productCount} products and {item.orderCount} orders</span
										>
									</Card.Footer>
								</Card.Root>
							</a>
						{/each}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
