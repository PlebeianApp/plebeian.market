<script lang="ts">
	import Auth from '$lib/components/auth.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
</script>

<header class="sticky top-0 z-30 bg-black px-4 py-4 text-white lg:px-12">
	<div class="container flex h-full w-full items-center justify-between">
		<section class=" inline-flex items-center">
			<a href="/"><img src="/logo.svg" alt="logo" class="w-16 px-2" /></a>
			<div class="hidden lg:flex mx-8 gap-8">
				<a class="hover:underline font-semibold" href="/stalls/">Stall Browser</a>
				<a class="hover:underline font-semibold" href="/">Market Square</a>
				<a class="hover:underline font-semibold" href="/">Plebeian Planet</a>
			</div>
		</section>
		<div class="flex items-center gap-4">
			<Button class="hidden sm:flex p-2 bg-[var(--neo-yellow)]" href="/"><span class="i-tdesign-mail text-black w-6 h-6"></span></Button>
			<Button class="p-2 hidden sm:flex" href="/"><span class="i-tdesign-cart text-black w-6 h-6"></span></Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button class="p-2 bg-white" builders={[builder]}><span class="i-tdesign-view-list text-black w-6 h-6"></span></Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-32">
					<DropdownMenu.Label>
						<Auth />
					</DropdownMenu.Label>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</header>
