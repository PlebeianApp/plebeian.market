<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
</script>

<div class="pb-4 space-y-2">
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
