<script lang="ts">
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import { page } from '$app/stores'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Command from '$lib/components/ui/command/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import * as Popover from '$lib/components/ui/popover/index.js'
	import { Textarea } from '$lib/components/ui/textarea'
	import { KindProducts, KindStalls } from '$lib/constants'
	import ndkStore, { ndk } from '$lib/stores/ndk'
	import { createEventDispatcher, onMount, tick } from 'svelte'

	import type { ISO3 } from '@plebeian/database/constants'
	import { COUNTRIES_ISO, CURRENCIES } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import type { PageData } from '../../../routes/$types'
	import { stallEventSchema } from '../../../schema/nostr-events'
	import PaymentMethodsStall from './payment-methods-stall.svelte'
	import { createShippingQuery } from '$lib/fetch/shipping.queries'
	import { get } from 'svelte/store'
	import { createStallFromNostrEvent, updateStallFromNostrEvent } from '$lib/fetch/stalls.mutations'

	const { appSettings, paymentDetailsMethod } = $page.data as PageData

	export let stall: RichStall | null = null

	type Currency = (typeof CURRENCIES)[number]
	type Shipping = (typeof stallEventSchema._type)['shipping'][0]

	let currency: Currency = (stall?.currency as Currency) ?? appSettings.defaultCurrency ?? 'BTC'

	class ShippingMethod implements Shipping {
		id: string
		name: string
		cost: string
		regions: ISO3[]

		constructor(id: string, name: string, cost: string, regions: ISO3[] = []) {
			this.id = id
			this.name = name
			this.cost = cost
			this.regions = regions
		}

		addZone(zone: string) {
			this.regions.push(zone as ISO3)
			shippingMethods = shippingMethods
		}

		removeZone(zone: string) {
			this.regions = this.regions.filter((z) => z !== zone)
			shippingMethods = shippingMethods
		}

		get json() {
			return {
				id: this.id,
				name: this.name,
				cost: this.cost,
				regions: this.regions,
			} as Shipping
		}
	}

	let shippingMethods: ShippingMethod[] = []

	function addShipping(id?: string) {
		if (id) {
			const existingMethod = shippingMethods.find((method) => method.id === id)
			if (existingMethod) {
				const duplicatedMethod = new ShippingMethod(createId(), existingMethod.name!, existingMethod.cost, existingMethod.regions)
				shippingMethods = [...shippingMethods, duplicatedMethod]
			} else {
				console.error(`No shipping method found with id ${id}`)
			}
		} else {
			const newMethod = new ShippingMethod(createId(), '', '0')
			shippingMethods = [...shippingMethods, newMethod]
		}
	}

	function removeShipping(id: string) {
		shippingMethods = shippingMethods.filter((s) => s.id !== id)
	}

	onMount(async () => {
		if (stall) {
			const { data: initialShippings } = await get(createShippingQuery(stall.id)).refetch()

			shippingMethods = initialShippings?.map(
				(s) =>
					new ShippingMethod(
						s.id,
						s.name,
						s.cost,
						s.zones.map((z) => z.region as ISO3),
					),
			) ?? []
		}
	})

	function closeAndFocusTrigger(triggerId: string) {
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}

	const dispatch = createEventDispatcher<{
		success: unknown
	}>()

	async function create(sEvent: SubmitEvent) {
		if (!$ndkStore.activeUser?.pubkey) return
		const formData = new FormData(sEvent.currentTarget as HTMLFormElement, sEvent.submitter)
		const identifier = stall?.identifier ? stall.identifier : createId()
		const id = stall?.id ?? `${KindProducts}:${$ndkStore.activeUser.pubkey}:${identifier}`

		const evContent = {
			id,
			name: formData.get('title'),
			description: formData.get('description'),
			currency: currency,
			shipping: shippingMethods.map((s) => s.json),
		}
		const newEvent = new NDKEvent($ndkStore, {
			kind: KindStalls,
			pubkey: $ndkStore.activeUser.pubkey,
			content: JSON.stringify(evContent),
			created_at: Math.floor(Date.now()),
			tags: [['d', identifier]],
		})

		await newEvent.sign(ndk.signer)
		const nostrEvent = await newEvent.toNostrEvent()
		// TODO refactor this to mutation
		if (stall) {
			await get(updateStallFromNostrEvent).mutateAsync([id, nostrEvent])
		} else {
			await get(createStallFromNostrEvent).mutateAsync(nostrEvent)
		}
		dispatch('success', null)
	}
</script>

<form class="flex flex-col gap-4 grow" on:submit|preventDefault={create}>
	<div class="grid w-full items-center gap-1.5">
		<Label for="title" class="font-bold">Title</Label>
		<Input value={stall?.name} required class="border-2 border-black" type="text" name="title" placeholder="e.g. Fancy Wears" />
	</div>
	<div class="grid w-full items-center gap-1.5">
		<Label for="description" class="font-bold">Description (Optional)</Label>
		<Textarea value={stall?.description} class="border-2 border-black" placeholder="Description" name="description" />
	</div>
	<div class="grid w-full items-center gap-1.5">
		<Label for="from" class="font-bold">Shipping From (Optional)</Label>
		<Input class="border-2 border-black" type="text" name="from" placeholder="e.g. London" />
	</div>

	<div class="grid w-full items-center gap-1.5">
		<Label for="from" class="font-bold">Currency</Label>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="border-2 border-black" builders={[builder]}>{currency}</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>Currency</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<section class=" max-h-[350px] overflow-y-auto">
					{#each CURRENCIES as option}
						<DropdownMenu.CheckboxItem checked={currency === option} on:click={() => (currency = option)}>
							{option}
						</DropdownMenu.CheckboxItem>
					{/each}
				</section>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	{#each shippingMethods as item, i}
		<div class="grid grid-cols-[1fr_1fr_1fr_auto] w-full items-end gap-2">
			<div>
				<Label for="from" class="font-bold">{i + 1}. Shipping Name</Label>
				<Input required bind:value={item.name} class="border-2 border-black" type="text" name="shipping" placeholder="24/28h Europe" />
			</div>
			<div>
				<Label for="from" class="font-bold">Base Cost</Label>
				<Input
					bind:value={item.cost}
					class="border-2 border-black"
					min={0}
					type="text"
					pattern="^(?!.*\\.\\.)[0-9]*([.][0-9]+)?"
					name="shipping"
					placeholder="e.g. $30"
				/>
			</div>

			<div>
				<Label for="from" class="font-bold">Zones</Label>
				<section>
					<Popover.Root let:ids>
						<Popover.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="outline"
								role="combobox"
								aria-expanded="true"
								class="w-full max-w-full border-2 border-black justify-between truncate"
								>{item.regions.length ? item.regions.join(', ') : 'Select'}</Button
							>
						</Popover.Trigger>
						<Popover.Content class="w-[200px] max-h-[350px] overflow-y-auto p-0">
							<Command.Root>
								<Command.Input placeholder="Search country..." />
								<Command.Empty>No country found.</Command.Empty>
								<Command.Group>
									{#each Object.values(COUNTRIES_ISO).sort((a, b) => {
										if (item.regions.includes(a.iso3) && item.regions.includes(b.iso3)) {
											return 0
										} else if (item.regions.includes(a.iso3)) {
											return -1
										} else if (item.regions.includes(b.iso3)) {
											return 1
										}
										return 0
									}) as country}
										<Command.Item
											value={country.iso3}
											onSelect={(currentValue) => {
												if (item.regions.includes(country.iso3)) {
													item.removeZone(currentValue)
												} else {
													item.addZone(currentValue)
												}

												closeAndFocusTrigger(ids.trigger)
											}}
										>
											<section class="flex flex-col">
												<div class="flex gap-2">
													{#if item.regions.includes(country.iso3)}
														<span class="i-tdesign-check"> </span>
													{/if}

													<span>{country.iso3}</span>
												</div>

												<small>({country.name})</small>
											</section>
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
				</section>
			</div>

			<div class="h-full flex flex-col justify-end">
				<div class="flex gap-1">
					<Button on:click={() => addShipping(item.id)} variant="outline" class="font-bold border-0 h-full"
						><span class="i-tdesign-copy"></span></Button
					>
					<Button on:click={() => removeShipping(item.id)} variant="outline" class="font-bold text-red-500 border-0 h-full"
						><span class="i-tdesign-delete-1"></span></Button
					>
				</div>
			</div>
		</div>
	{/each}

	<div class="grid gap-1.5">
		<Button on:click={() => addShipping()} variant="outline" class="font-bold ml-auto">Add Shipping Method</Button>
	</div>
	{#if stall}
		<PaymentMethodsStall {stall} {paymentDetailsMethod} />
	{/if}
	<Button type="submit" class="w-full font-bold">Save</Button>
</form>
