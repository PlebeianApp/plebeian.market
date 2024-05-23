<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Textarea } from '$lib/components/ui/textarea'
	import { KindProducts } from '$lib/constants'
	import { createId } from '@plebeian/database'
	import { ndk, ndkActiveUser } from '$lib/stores/ndk'
	import NDK, { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'

	export let item: RichStall | null = null

	async function create(sEvent: SubmitEvent) {
		const formData = new FormData(sEvent.currentTarget as HTMLFormElement, sEvent.submitter)
		const identifier = createId()
		const evContent = {
			id: `${KindProducts}:${$ndkActiveUser.pubkey}:${identifier}`,
			name: formData.get('title'),
			description: formData.get('description'),
			currency: 'USD',
			// shipping: [
			// 	{
			// 		id: Math.random().toString(36).substring(2, 15),
			// 		name: 'USPS',
			// 		cost: Math.random() * 10,
			// 		regions: ['US', 'CA'],
			// 	},
			// ],
		}
		const newEvent = new NDKEvent(new NDK({ signer: ndk.signer! }), {
			kind: 30017 as NDKKind,
			pubkey: $ndkActiveUser.pubkey,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now()),
			tags: [['d', identifier]],
		})

		await newEvent.sign(ndk.signer)
		const nostrEvent = await newEvent.toNostrEvent()
	console.log(nostrEvent)

		// const result = await fetch(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/api/v1/stalls`, {
		// 	method: 'POST',
		// 	body: JSON.stringify(nostrEvent),
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// }).then((response) => response.json())

		
	}
</script>

<form class="flex flex-col gap-4" on:submit|preventDefault={create}>
	<div class="grid w-full items-center gap-1.5">
		<Label for="title" class="font-bold">Title</Label>
		<Input required class="border border-2 border-black" type="text" id="title" placeholder="e.g. Fancy Wears" />
	</div>
	<div class="grid w-full items-center gap-1.5">
		<Label for="description" class="font-bold">Description (Optional)</Label>
		<Textarea class="border border-2 border-black" placeholder="Description" id="description" />
	</div>
	<div class="grid w-full items-center gap-1.5">
		<Label for="from" class="font-bold">Shipping From (Optional)</Label>
		<Input class="border border-2 border-black" type="text" id="from" placeholder="e.g. London" />
	</div>
	<Button type="submit" class="w-full font-bold">Save</Button>
</form>
