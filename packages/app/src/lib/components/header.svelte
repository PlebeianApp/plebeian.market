<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
</script>

<header class="sticky top-0 z-30 bg-black px-4 py-4 text-white lg:px-12">
	<div class="container flex h-full w-full items-center justify-between">
		<a href="/">logo</a>
		<div class="flex gap-8">
			<a class="hover:underline" href="/stalls/all">Stall Browser</a>
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
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</header>
