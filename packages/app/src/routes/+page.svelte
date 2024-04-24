<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Card from '$lib/components/ui/card/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import ProductItem from '$lib/components/product/item.svelte'
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<div class="flex flex-col">
		<header class="sticky top-0 z-30 bg-black px-4 py-4 text-white lg:px-12">
			<div class="container flex h-full w-full items-center justify-between">
				<a href="/">logo</a>
				<div class="flex gap-8">
					<a class="hover:underline" href="/">Stall Browser</a>
					<a class="hover:underline" href="/">Market Square</a>
					<a class="hover:underline" href="/">Plebeian Planet</a>
				</div>

				<div class="flex items-center gap-8">
					<a href="/">Private Messages</a>
					<a href="/">Cart</a>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button builders={[builder]}>Menu</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56">
							<DropdownMenu.Label>My Account</DropdownMenu.Label>
							<DropdownMenu.Separator />
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		</header>
		<main class="text-black">
			<div class="w-full bg-black py-20 text-center text-white">
				<h1 class="mb-8 text-5xl font-bold">Sell stuff for sats</h1>
				<Button class="p-6 text-xl font-bold">List my stuff</Button>
			</div>
			<div class=" bg-primary px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">Featured Collections</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each [1, 2, 3, 4] as item}
							<ProductItem />
						{/each}
					</div>
				</div>
			</div>
			<div class=" px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">Cool Products</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each [1, 2, 3, 4, 5, 6] as item}
							<ProductItem />
						{/each}
					</div>
				</div>
			</div>

			<div class=" bg-[#FFD53E] px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="mb-4 text-2xl font-bold">Events</h2>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
						{#each [1, 2, 3, 4] as item}
							<ProductItem />
						{/each}
					</div>
				</div>
			</div>
		</main>
		<footer class="bg-black p-4 font-bold text-white lg:px-12">
			<div class=" container flex justify-between">
				<div class="flex gap-4">
					<span>Plug into the bitcoin economy. Powered by Nostr.</span>
					<a class="underline" href="/">About</a>
					<a class="underline" href="/">FAQ</a>
					<a class="underline" href="/">Contact</a>
				</div>
				<div class="text-right">
					<a
						href="https://snort.social/p/npub1market6g3zl4mxwx5ugw56hfg0f7dy7jnnw8t380788mvdyrnwuqgep7hd"
						>Nostrich</a
					>
					<a href="https://twitter.com/PlebeianMarket">X</a>
					<a href="https://plebeianmarket.substack.com/">Substack</a>
					<a href="https://t.me/PlebeianMarket">Telegram</a>
					<a href="https://github.com/PlebeianTech/plebeian-market">Github</a>
				</div>
			</div>
		</footer>
	</div>
</div>
