<script lang="ts">
	import type { NDKTag } from '@nostr-dev-kit/ndk'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { Location } from '$lib/utils'
	import type { GeoJSON } from 'geojson'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { ShippingMethod } from '$lib/classes/shipping'
	import SingleImage from '$lib/components/settings/editable-image.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as Command from '$lib/components/ui/command'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import * as Popover from '$lib/components/ui/popover'
	import { Textarea } from '$lib/components/ui/textarea'
	import { KindStalls } from '$lib/constants'
	import { createStallFromNostrEvent, updateStallFromNostrEvent } from '$lib/fetch/stalls.mutations'
	import ndkStore from '$lib/stores/ndk'
	import { calculateGeohashAccuracy, checkIfUserExists, debounce, searchLocation, shouldRegister, unixTimeNow } from '$lib/utils'
	import geohash from 'ngeohash'
	import { createEventDispatcher, onMount } from 'svelte'

	import { COUNTRIES_ISO, CURRENCIES } from '@plebeian/database/constants'
	import { createId, createSlugId } from '@plebeian/database/utils'

	import Spinner from '../assets/spinner.svelte'
	import Leaflet from '../leaflet.svelte'

	// TODO get geotag from db
	// FIXME when try to add a geotag, caught (in promise) Error: Cannot have duplicate keys in a keyed each: Keys at index 0 and 1 with value 'undefined' are duplicates

	interface GeoJSONWithBoundingBox extends GeoJSON.Feature<GeoJSON.Point> {
		boundingbox: [number, number, number, number]
	}

	export let stall: Partial<RichStall> | null = null

	const dispatch = createEventDispatcher<{ success: unknown }>()

	const {
		appSettings: { allowRegister, defaultCurrency },
	} = $page.data

	let currency = stall?.currency ?? defaultCurrency ?? CURRENCIES[0]
	let headerImage = stall?.image
	let shippingMethods: ShippingMethod[] = []

	let locationSearchOpen = false
	let shippingFromInput = ''
	let selectedLocation: Location | null = null
	let geohashOfSelectedGeometry: string | null = null
	let locationResults: Location[] = []
	let mapGeoJSON: GeoJSONWithBoundingBox | null = null
	let isLoading = false

	const debouncedSearch = debounce(async () => {
		isLoading = true
		locationResults = await searchLocation(shippingFromInput)
		isLoading = false
	}, 300)

	$: if (browser && shippingFromInput) {
		debouncedSearch(shippingFromInput)
	}

	function addShipping(id?: string) {
		const newMethod = id
			? new ShippingMethod(createId(), shippingMethods.find((m) => m.id === id)?.name || '', '0')
			: new ShippingMethod(createId(), '', '0')
		shippingMethods = [...shippingMethods, newMethod]
	}

	function removeShipping(id: string) {
		shippingMethods = shippingMethods.filter((s) => s.id !== id)
	}

	function handleLocationSelect(location: Location) {
		shippingFromInput = location.display_name
		mapGeoJSON = {
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
			},
			properties: {},
			boundingbox: location.boundingbox.map(Number) as [number, number, number, number],
		}

		const [minLat, maxLat, minLon, maxLon] = mapGeoJSON.boundingbox
		const centerLat = (minLat + maxLat) / 2
		const centerLon = (minLon + maxLon) / 2
		const accuracy = calculateGeohashAccuracy(mapGeoJSON.boundingbox)

		geohashOfSelectedGeometry = geohash.encode(centerLat, centerLon, accuracy)
		selectedLocation = location
	}

	async function create(event: Event) {
		event.preventDefault()
		if (!$ndkStore.activeUser?.pubkey) return

		const form = event.target as HTMLFormElement
		const formData = new FormData(form)
		const stallTitle = String(formData.get('title'))
		const stallDescription = String(formData.get('description'))
		const identifier = createSlugId(stallTitle)

		const evContent = {
			id: identifier,
			name: stallTitle,
			description: stallDescription,
			currency,
			shipping: shippingMethods.map((s) => s.json),
		}

		const tags: NDKTag[] = [['d', identifier]]
		if (headerImage) tags.push(['image', headerImage])
		if (geohashOfSelectedGeometry) tags.push(['g', geohashOfSelectedGeometry])

		const newEvent = new NDKEvent($ndkStore, {
			kind: KindStalls,
			pubkey: $ndkStore.activeUser.pubkey,
			content: JSON.stringify(evContent),
			created_at: unixTimeNow(),
			tags,
		})

		await newEvent.sign()
		const userExist = await checkIfUserExists()
		const _shouldRegister = await shouldRegister(allowRegister, userExist)

		if (_shouldRegister) {
			const nostrEvent = await newEvent.toNostrEvent()
			if (stall?.id) {
				await $updateStallFromNostrEvent.mutateAsync([stall.id, nostrEvent])
			} else {
				await $createStallFromNostrEvent.mutateAsync(nostrEvent)
			}
		}

		dispatch('success', null)
	}

	onMount(() => {
		shippingMethods = stall?.shipping?.map((s) => new ShippingMethod(s?.id, s?.name, s?.cost, s?.regions, s?.countries)) ?? []
	})
</script>

<form class="flex flex-col gap-4 grow" on:submit={create}>
	<Collapsible.Root>
		<Collapsible.Trigger asChild let:builder>
			<Button builders={[builder]} variant="ghost" size="sm" class="w-full p-0">
				<Label for="userImage" class="font-bold">Header image (Optional)</Label>
				<span class="i-ion-chevron-expand" />
			</Button>
		</Collapsible.Trigger>
		<Collapsible.Content>
			<SingleImage src={headerImage || stall?.image || ''} on:save={({ detail }) => (headerImage = detail)} />
		</Collapsible.Content>
	</Collapsible.Root>

	<div class="grid w-full items-center gap-1.5">
		<Label for="title" class="font-bold">Title</Label>
		<Input value={stall?.name} required class="border-2 border-black" type="text" name="title" placeholder="e.g. Fancy Wears" />
	</div>

	<div class="grid w-full items-center gap-1.5">
		<Label for="description" class="font-bold">Description (Optional)</Label>
		<Textarea value={stall?.description} class="border-2 border-black" placeholder="Description" name="description" />
	</div>

	<Collapsible.Root>
		<Collapsible.Trigger asChild let:builder>
			<Button builders={[builder]} variant="ghost" size="sm" class="w-full p-0">
				<Label for="from" class="font-bold">Shipping From (Optional)</Label>
				<span class="i-ion-chevron-expand" />
			</Button>
		</Collapsible.Trigger>
		<Collapsible.Content>
			{#if geohashOfSelectedGeometry}
				<small class="ml-2 text-gray-500">Geohash: {geohashOfSelectedGeometry}</small>
			{/if}
			<Leaflet geoJSON={mapGeoJSON} />
			<Popover.Root bind:open={locationSearchOpen} let:ids>
				<Popover.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						role="combobox"
						aria-expanded={locationSearchOpen}
						class="w-full justify-between border-2 border-black"
					>
						{selectedLocation?.display_name ?? 'Select a location...'}
						{#if isLoading}
							<Spinner />
						{/if}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-2/4 p-0">
					<Command.Root>
						<Command.Input placeholder="Search location..." bind:value={shippingFromInput} />
						<Command.Empty>No location found.</Command.Empty>
						<Command.Group>
							{#each locationResults as location (location.id)}
								<Command.Item
									value={location.display_name}
									onSelect={() => {
										handleLocationSelect(location)
										locationSearchOpen = false
										document.getElementById(ids.trigger)?.focus()
									}}
								>
									{location.display_name}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		</Collapsible.Content>
	</Collapsible.Root>

	<div class="grid w-full items-center gap-1.5">
		<Label for="currency" class="font-bold">Currency</Label>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="border-2 border-black" builders={[builder]}>{currency}</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
				<DropdownMenu.Label>Currency</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<section class="max-h-[350px] overflow-y-auto">
					{#each CURRENCIES as option}
						<DropdownMenu.CheckboxItem checked={currency === option} on:click={() => (currency = option)}>
							{option}
						</DropdownMenu.CheckboxItem>
					{/each}
				</section>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	{#each shippingMethods as item, i (item.id)}
		<div class="grid grid-cols-[1fr_1fr_1fr_auto] w-full items-end gap-2">
			<div>
				<Label for={`shipping-name-${i}`} class="font-bold">{i + 1}. Shipping Name</Label>
				<Input
					required
					bind:value={item.name}
					class="border-2 border-black"
					type="text"
					id={`shipping-name-${i}`}
					placeholder="24/28h Europe"
				/>
			</div>
			<div>
				<Label for={`shipping-cost-${i}`} class="font-bold">Base Cost</Label>
				<Input
					bind:value={item.cost}
					class="border-2 border-black"
					min={0}
					type="text"
					pattern="^(?!.*\.\.)[0-9]*([.][0-9]+)?"
					id={`shipping-cost-${i}`}
					placeholder="e.g. $30"
				/>
			</div>
			<div>
				<Label for={`shipping-countries-${i}`} class="font-bold">Countries</Label>
				<Popover.Root let:ids>
					<Popover.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							variant="outline"
							role="combobox"
							aria-expanded="true"
							class="w-full max-w-full border-2 border-black justify-between truncate"
						>
							{item.countries.length ? item.countries.join(', ') : 'Select'}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-[200px] max-h-[350px] overflow-y-auto p-0">
						<Command.Root>
							<Command.Input placeholder="Search country..." />
							<Command.Empty>No country found.</Command.Empty>
							<Command.Group>
								{#each Object.values(COUNTRIES_ISO).sort((a, b) => {
									if (item.countries.includes(a.iso3) && item.countries.includes(b.iso3)) return 0
									if (item.countries.includes(a.iso3)) return -1
									if (item.countries.includes(b.iso3)) return 1
									return 0
								}) as country (country.iso3)}
									<Command.Item
										value={country.iso3}
										onSelect={(currentValue) => {
											if (item.countries.includes(country.iso3)) {
												item.removeCountry(currentValue)
											} else {
												item.addCountry(currentValue)
											}
											shippingMethods = shippingMethods
											document.getElementById(ids.trigger)?.focus()
										}}
									>
										<section class="flex flex-col">
											<div class="flex gap-2">
												{#if item.countries.includes(country.iso3)}
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
			</div>
			<div class="h-full flex flex-col justify-end">
				<div class="flex gap-1">
					<Button on:click={() => addShipping(item.id)} variant="outline" class="font-bold border-0 h-full">
						<span class="i-tdesign-copy"></span>
					</Button>
					<Button on:click={() => removeShipping(item.id)} variant="outline" class="font-bold text-red-500 border-0 h-full">
						<span class="i-tdesign-delete-1"></span>
					</Button>
				</div>
			</div>
		</div>
	{/each}

	<div class="grid gap-1.5">
		<Button on:click={() => addShipping()} variant="outline" class="font-bold ml-auto">Add Shipping Method</Button>
	</div>

	<Button type="submit" class="w-full font-bold">Save</Button>
</form>
