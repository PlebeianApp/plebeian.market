<script lang="ts">
	import StallItem from '$lib/components/stalls/item.svelte'
	import ProductItem from '$lib/components/product/item.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import Button from '$lib/components/ui/button/button.svelte'
</script>

<div class="bg-muted/40 flex min-h-screen w-full flex-col">
	<div class="flex flex-col">
		<main class="text-black">
			<div class="flex w-full flex-col items-center bg-black py-20 text-center text-white">
				<section class="w-fit">
					<a href="##" class="flex flex-col items-center">
						<Avatar class="h-20 w-20">
							<AvatarImage src={'https://m.primal.net/HwgC.jpg'} alt="@shadcn" />
							<AvatarFallback>{'Mohammad'}</AvatarFallback>
						</Avatar>
					</a>
					<span class="block my-4">{'Mohammad Bagher Abiyat'}</span>
					<div class="flex items-center justify-center">
						<Button variant="secondary" class="w-1/2 lg:w-auto">
							<code class="truncate"
								>{'npub1nem740rt03t45cv6kl8zxkean9zrluem3wwcqh4vchkr5w9y39mqrt43h9'}</code
							>
						</Button>
						<Button>Copy</Button>
					</div>
				</section>
			</div>
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">Stalls</h2>
					<div
						class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
					>
						{#each [1, 2, 3] as item}
							<a href={`/stalls/${item.id}`}>
								<StallItem {item} />
							</a>
						{/each}
					</div>
				</div>
				<div class="px-4 py-20 lg:px-12">
					<div class="container">
						<h2 class="mb-4 text-2xl font-bold">Products</h2>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
							{#each [1, 2, 3] as item}
								<ProductItem />
							{/each}
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
