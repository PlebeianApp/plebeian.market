<script lang="ts">
	import { page } from '$app/stores'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class="pb-4 space-y-2">
	<div class=" flex items-center gap-1">
		<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
			<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
		</Button>
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-gray-600">{linkDetails?.description}</p>
		</section>
	</div>

	<form class="flex flex-col gap-4">
		<div class="grid w-full items-center gap-1.5">
			<Label for="lud16" class="font-bold">Lightning Address</Label>
			<Input type="email" id="lud16" placeholder="e.g. username@walletofsatoshi.com" />
		</div>
		<div class="grid w-full items-center gap-1.5">
			<Label for="xpub" class="font-bold">XPUB / ZPUB</Label>
			<Input id="xpub" placeholder="" />
		</div>
		<div class="grid w-full items-center gap-1.5">
			<Label for="walletName" class="font-bold">Wallet Name (Optional)</Label>
			<Input id="walletName" placeholder="e.g. Shop Wallet" />
		</div>
		<Button class="w-full font-bold">Save</Button>
	</form>
</div>
