<script lang="ts">
	import type { NDKTag } from '@nostr-dev-kit/ndk'
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { GeoJSON } from 'geojson'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import SingleImage from '$lib/components/settings/editable-image.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Command from '$lib/components/ui/command/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import * as Popover from '$lib/components/ui/popover/index.js'
	import { Textarea } from '$lib/components/ui/textarea'
	import { KindStalls } from '$lib/constants'
	import { createStallFromNostrEvent, updateStallFromNostrEvent } from '$lib/fetch/stalls.mutations'
	import ndkStore from '$lib/stores/ndk'
	import { checkIfUserExists, shouldRegister, unixTimeNow } from '$lib/utils'
	import geohash from 'ngeohash'
	import { createEventDispatcher, onMount, tick } from 'svelte'
	import { get } from 'svelte/store'

	import { COUNTRIES_ISO, CURRENCIES } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import { stallEventSchema } from '../../../schema/nostr-events'
	import Leaflet from '../leaflet.svelte'

	interface GeoJSONWithBoundingBox extends GeoJSON.Feature<GeoJSON.Point> {
		boundingbox: [number, number, number, number]
	}

	const {
		appSettings: { allowRegister, defaultCurrency },
	} = $page.data

	export let stall: RichStall | null = null

	let locationSearchOpen = false
	let shippingFromInput = ''
	let selectedLocation: Location | null = null

	let geohashOfSelectedGeometry: string | null = null

	let locationResults: Location[] = []
	let mapGeoJSON: GeoJSONWithBoundingBox | null = null

	interface Location {
		id: string
		display_name: string
		lat: string
		lon: string
		boundingbox: [number, number, number, number]
	}

	const calculateGeohashAccuracy = (boundingbox: [number, number, number, number]): number => {
		const [minLat, maxLat, minLon, maxLon] = boundingbox.map(Number)
		const latDiff = maxLat - minLat
		const lonDiff = maxLon - minLon
		const maxDiff = Math.max(latDiff, lonDiff)

		if (maxDiff < 0.0001) return 9 // ~5m
		if (maxDiff < 0.001) return 8 // ~40m
		if (maxDiff < 0.01) return 7 // ~150m
		if (maxDiff < 0.1) return 6 // ~1km
		if (maxDiff < 1) return 5 // ~5km
		return 4 // ~20km
	}

	const debounce = (func: (...args: unknown[]) => void, delay: number) => {
		let timeoutId: ReturnType<typeof setTimeout>
		return (...args: unknown[]) => {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => func(...args), delay)
		}
	}

	const searchLocation = async (query: string) => {
		if (query.length < 3) return
		const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
		const data = await response.json()

		locationResults = data.map((item: Location) => ({
			id: item.place_id,
			display_name: item.display_name,
			lat: item.lat,
			lon: item.lon,
			boundingbox: item.boundingbox,
		}))
	}

	const debouncedSearch = debounce(searchLocation, 300)

	const handleLocationSelect = (locationId: string) => {
		const location = locationResults.find((loc) => loc.id === locationId)

		if (location) {
			shippingFromInput = location.display_name
			mapGeoJSON = {
				type: 'Point',
				coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
				boundingbox: location.boundingbox,
			}

			const [minLat, maxLat, minLon, maxLon] = location.boundingbox.map(Number)
			const centerLat = (minLat + maxLat) / 2
			const centerLon = (minLon + maxLon) / 2
			const accuracy = calculateGeohashAccuracy(mapGeoJSON.boundingbox)

			geohashOfSelectedGeometry = geohash.encode(centerLat, centerLon, accuracy)
		}
	}

	function closeAndFocusTrigger(triggerId: string) {
		locationSearchOpen = false
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}

	$: if (browser && shippingFromInput) {
		debouncedSearch(shippingFromInput)
	}

	type Currency = (typeof CURRENCIES)[number]
	type Shipping = (typeof stallEventSchema._type)['shipping'][0]

	let currency: Currency = (stall?.currency as Currency) ?? defaultCurrency ?? 'BTC'
	let headerImage = stall?.image

	class ShippingMethod implements Shipping {
		id: string
		name: string
		cost: string
		regions: string[]
		countries: string[]

		constructor(id: string, name: string, cost: string, regions: string[] = [], countries: string[] = []) {
			this.id = id
			this.name = name
			this.cost = cost
			this.regions = regions
			this.countries = countries
		}

		addRegion(region: string) {
			this.regions.push(region)
			shippingMethods = shippingMethods
		}

		removeRegion(region: string) {
			this.regions = this.regions.filter((z) => z !== region)
			shippingMethods = shippingMethods
		}

		addCountry(country: string) {
			this.countries.push(country)
			shippingMethods = shippingMethods
		}

		removeCountry(country: string) {
			this.countries = this.countries.filter((z) => z !== country)
			shippingMethods = shippingMethods
		}

		get json() {
			return {
				id: this.id,
				name: this.name,
				cost: this.cost,
				regions: this.regions,
				countries: this.countries,
			} as Shipping
		}
	}

	let shippingMethods: ShippingMethod[] = []

	function addShipping(id?: string) {
		if (id) {
			const existingMethod = shippingMethods.find((method) => method.id === id)
			if (existingMethod) {
				const duplicatedMethod = new ShippingMethod(
					createId(),
					existingMethod.name!,
					existingMethod.cost,
					existingMethod.regions,
					existingMethod.countries,
				)
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

	const dispatch = createEventDispatcher<{
		success: unknown
	}>()

	async function create(sEvent: SubmitEvent) {
		if (!$ndkStore.activeUser?.pubkey) return
		const userId = $ndkStore.activeUser.pubkey
		const formData = new FormData(sEvent.currentTarget as HTMLFormElement, sEvent.submitter)
		const identifier = stall?.identifier ? stall.identifier : createId()

		const imageTag = headerImage ? ['image', headerImage] : null

		const evContent = {
			id: identifier,
			name: formData.get('title'),
			description: formData.get('description'),
			currency: currency,
			shipping: shippingMethods.map((s) => s.json),
		}

		const tags: NDKTag[] = [['d', identifier]]
		if (imageTag) tags.push(imageTag)
        if (geohashOfSelectedGeometry) {
            tags.push(['g', geohashOfSelectedGeometry])
        }

		const newEvent = new NDKEvent($ndkStore, {
			kind: KindStalls,
			pubkey: userId,
			content: JSON.stringify(evContent),
			created_at: unixTimeNow(),
			tags: tags,
		})

		// await newEvent.publish().then((data) => console.log(data))
		await newEvent.sign()
		const userExist = await checkIfUserExists()
		const _shouldRegister = await shouldRegister(allowRegister, userExist)
		if (_shouldRegister) {
			const nostrEvent = await newEvent.toNostrEvent()
			if (stall) {
				await get(updateStallFromNostrEvent).mutateAsync([stall.id, nostrEvent])
			} else {
				await get(createStallFromNostrEvent).mutateAsync(nostrEvent)
			}
		}

		dispatch('success', null)
	}

	onMount(async () => {
		if (stall?.shipping) {
			shippingMethods =
				stall?.shipping?.map(
					(s) => new ShippingMethod(s?.id as string, s?.name as string, s?.cost as string, s?.regions ?? [], s?.countries ?? []),
				) ?? []
		}
	})

	const handleSaveBannerImage = (event: CustomEvent) => {
		headerImage = event.detail
	}
</script>

<form class="flex flex-col gap-4 grow" on:submit|preventDefault={create}>
	<div class="grid w-full items-center gap-1.5">
		<Label for="userImage" class="font-bold">Header image</Label>
		<SingleImage src={headerImage ?? stall?.image} on:save={handleSaveBannerImage} />
	</div>

	<div class="grid w-full items-center gap-1.5">
		<Label for="title" class="font-bold">Title</Label>
		<Input value={stall?.name} required class="border-2 border-black" type="text" name="title" placeholder="e.g. Fancy Wears" />
	</div>
	<div class="grid w-full items-center gap-1.5">
		<Label for="description" class="font-bold">Description (Optional)</Label>
		<Textarea value={stall?.description} class="border-2 border-black" placeholder="Description" name="description" />
	</div>
	<div class="grid w-full items-center gap-1.5">
		<div class="flex flex-row justify-between">
			<Label for="from" class="font-bold">Shipping From (Optional)</Label>
			{#if geohashOfSelectedGeometry}
				<small class="ml-2 text-gray-500">Geohash: {geohashOfSelectedGeometry}</small>
			{:else}
				<small class="ml-2 text-gray-500">No geohash available</small>
			{/if}
		</div>
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
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-2/4 p-0">
				<Command.Root>
					<Command.Input placeholder="Search location..." bind:value={shippingFromInput} />
					<Command.Empty>No location found.</Command.Empty>
					<Command.Group>
						{#each locationResults as location}
							<Command.Item
								value={location.display_name}
								onSelect={() => {
									handleLocationSelect(location.id)
									closeAndFocusTrigger(ids.trigger)
								}}
							>
								{location.display_name}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
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
				<Label for="from" class="font-bold">Countries</Label>
				<section>
					<Popover.Root let:ids>
						<Popover.Trigger asChild let:builder>
							<Button
								builders={[builder]}
								variant="outline"
								role="combobox"
								aria-expanded="true"
								class="w-full max-w-full border-2 border-black justify-between truncate"
								>{item.countries.length ? item.countries.join(', ') : 'Select'}</Button
							>
						</Popover.Trigger>
						<Popover.Content class="w-[200px] max-h-[350px] overflow-y-auto p-0">
							<Command.Root>
								<Command.Input placeholder="Search country..." />
								<Command.Empty>No country found.</Command.Empty>
								<Command.Group>
									{#each Object.values(COUNTRIES_ISO).sort((a, b) => {
										if (item.countries.includes(a.iso3) && item.countries.includes(b.iso3)) {
											return 0
										} else if (item.countries.includes(a.iso3)) {
											return -1
										} else if (item.countries.includes(b.iso3)) {
											return 1
										}
										return 0
									}) as country}
										<Command.Item
											value={country.iso3}
											onSelect={(currentValue) => {
												if (item.countries.includes(country.iso3)) {
													item.removeCountry(currentValue)
												} else {
													item.addCountry(currentValue)
												}

												closeAndFocusTrigger(ids.trigger)
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
	<!-- {#if stall}
		<PaymentMethodsStall {stall} {paymentDetailsMethod} />
	{/if} -->
	<Button type="submit" class="w-full font-bold">Save</Button>
</form>
