<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import NDK, { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Textarea } from '$lib/components/ui/textarea'
	import { KindProducts } from '$lib/constants'
	import { ndk, ndkActiveUser } from '$lib/stores/ndk'
	import { createEventDispatcher } from 'svelte'

	import { CURRENCIES } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import { stallEventSchema } from '../../../schema/nostr-events'

	export let stall: RichStall | null = null

	type Currency = (typeof CURRENCIES)[number]
	type Shipping = (typeof stallEventSchema._type)['shipping']

	let currency: Currency = (stall?.currency as Currency) ?? 'USD'
	let shipping: Shipping = []

	function addShipping() {
		shipping = [
			...shipping,
			{
				id: Math.random().toString(36).substring(2, 15),
				name: '',
				cost: 0,
				regions: [],
			},
		]
	}

	addShipping()

	const dispatch = createEventDispatcher<{
		success: unknown
	}>()

	async function create(sEvent: SubmitEvent) {
		const formData = new FormData(sEvent.currentTarget as HTMLFormElement, sEvent.submitter)
		const identifier = stall?.identifier ?? createId()

		const evContent = {
			id: stall?.id ?? `${KindProducts}:${$ndkActiveUser.pubkey}:${identifier}`,
			name: formData.get('title'),
			description: formData.get('description'),
			currency: currency,
			shipping,
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

		await fetch(new URL(stall ? `/api/v1/stalls/${stall.id}` : '/api/v1/stalls', window.location.origin), {
			method: stall ? 'PUT' : 'POST',

			body: JSON.stringify(nostrEvent),
			headers: {
				'Content-Type': 'application/json',
			},
		})
		dispatch('success', null)
	}
</script>

<form class="flex flex-col gap-4" on:submit|preventDefault={create}>
	<div class="grid w-full items-center gap-1.5">
		<Label for="title" class="font-bold">Title</Label>
		<Input value={stall?.name} required class="border border-2 border-black" type="text" name="title" placeholder="e.g. Fancy Wears" />
	</div>
	<div class="grid w-full items-center gap-1.5">
		<Label for="description" class="font-bold">Description (Optional)</Label>
		<Textarea value={stall?.description} class="border border-2 border-black" placeholder="Description" name="description" />
	</div>
	<div class="grid w-full items-center gap-1.5">
		<Label for="from" class="font-bold">Shipping From (Optional)</Label>
		<Input class="border border-2 border-black" type="text" name="from" placeholder="e.g. London" />
	</div>

	<div class="grid w-full items-center gap-1.5">
		<Label for="from" class="font-bold">Currency</Label>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="border border-2 border-black" builders={[builder]}>{currency}</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>Currency</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{#each CURRENCIES as option}
					<DropdownMenu.CheckboxItem checked={currency === option} on:click={() => (currency = option)}>
						{option}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	{#each shipping as item, i}
		<div class="grid grid-cols-3 w-full items-center gap-1.5">
			<div>
				<Label for="from" class="font-bold">{i + 1}. Shipping Name</Label>
				<Input bind:value={item.name} class="border border-2 border-black" type="text" name="shipping" placeholder="24/28h Europe" />
			</div>
			<div>
				<Label for="from" class="font-bold">Base Cost</Label>
				<Input bind:value={item.cost} class="border border-2 border-black" min={0} type="number" name="shipping" placeholder="e.g. $30" />
			</div>

			<div class="w-full">
				<Label for="from" class="font-bold">Zones</Label>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button variant="outline" class="w-full border border-2 border-black" builders={[builder]}>{currency}</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Label>Currency</DropdownMenu.Label>
						<DropdownMenu.Separator />
						{#each CURRENCIES as option}
							<DropdownMenu.CheckboxItem checked={currency === option} on:click={() => (currency = option)}>
								{option}
							</DropdownMenu.CheckboxItem>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	{/each}

	<div class="grid gap-1.5">
		<Button on:click={addShipping} variant="outline" class="font-bold ml-auto">Add Shipping Method</Button>
	</div>
	<Button type="submit" class="w-full font-bold">Save</Button>
</form>
