<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'

	import type { PageData } from './$types'

	export let data: PageData

	const linkDetails = data.menuItems
		.find((item) => item.value === 'account-settings')
		?.links.find((item) => item.href === $page.url.pathname)
</script>

<div class="pb-4 space-y-2">
	<div class=" flex items-center gap-1">
		<section>
			<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
			<p class="text-gray-600">{linkDetails?.description}</p>
		</section>
	</div>
	<Alert.Root class="bg-[var(--neo-blue)]">
		<Alert.Description
			>All sales inquiries will go into your direct message inbox automatically. The email address helps ensure you don’t miss anything,
			just in case.</Alert.Description
		>
	</Alert.Root>

	<form class="flex flex-col gap-4">
		<div class="grid w-full items-center gap-1.5">
			<Label for="email" class="font-bold">Email Address</Label>
			<Input type="email" id="email" placeholder="e.g. username@walletofsatoshi.com" />
		</div>
		<Button variant="primary" class="w-full font-bold">Save</Button>
	</form>
</div>
