<script lang="ts">
	import type { NDKTag } from '@nostr-dev-kit/ndk'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { Location } from '$lib/utils'
	import type { ValidationErrors } from '$lib/utils/zod.utils'
	import type { GeoJSON } from 'geojson'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { ShippingMethod } from '$lib/classes/shipping'
	import SingleImage from '$lib/components/settings/editable-image.svelte'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as Command from '$lib/components/ui/command'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import * as Popover from '$lib/components/ui/popover'
	import { Textarea } from '$lib/components/ui/textarea'
	import { KindStalls, SHIPPING_TEMPLATES } from '$lib/constants'
	import { createStallFromNostrEvent, deleteStallMutation, updateStallFromNostrEvent } from '$lib/fetch/stalls.mutations'
	import ndkStore from '$lib/stores/ndk'
	import {
		calculateGeohashAccuracy,
		checkIfUserExists,
		createChangeTracker,
		debounce,
		getGeohashAccuracyText,
		searchLocation,
		shouldRegister,
		unixTimeNow,
	} from '$lib/utils'
	import { deleteEvent, publishEvent } from '$lib/utils/nostr.utils'
	import { validateForm } from '$lib/utils/zod.utils'
	import geohash from 'ngeohash'
	import { createEventDispatcher, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import { get } from 'svelte/store'

	import { COUNTRIES_ISO, CURRENCIES } from '@plebeian/database/constants'
	import { createId, createSlugId } from '@plebeian/database/utils'

	import { forbiddenPatternStore } from '../../../schema/nostr-events'
	import Spinner from '../assets/spinner.svelte'
	import Leaflet from '../leaflet/leaflet.svelte'
	import Separator from '../ui/separator/separator.svelte'

	export let stall: Partial<RichStall> | null = null
	let shippingFromOpen = false
	const dispatch = createEventDispatcher<{ success: unknown; error: unknown }>()
	const {
		appSettings: { allowRegister, defaultCurrency },
	} = $page.data

	const initialValues = {
		name: stall?.name ?? '',
		description: stall?.description ?? '',
		currency: stall?.currency ?? defaultCurrency ?? CURRENCIES[0],
		image: stall?.image ?? '',
		geohash: stall?.geohash ?? null,
		shipping: stall?.shipping ?? [],
	}

	let { name, description, currency, image: headerImage, geohash: geohashOfSelectedGeometry } = initialValues
	let shippingMethods =
		initialValues.shipping.length > 0
			? initialValues.shipping.map((s) => new ShippingMethod(s.id, s.name, s.cost, s.regions, s.countries))
			: [new ShippingMethod(createId(), SHIPPING_TEMPLATES[0].name, SHIPPING_TEMPLATES[0].cost, [], SHIPPING_TEMPLATES[0].countries)]
	let locationSearchOpen = false
	let shippingFromInput = ''
	let selectedLocation: Location | null = null
	let locationResults: Location[] = []
	let mapGeoJSON: (GeoJSON.Feature<GeoJSON.Point> & { boundingbox: [number, number, number, number] }) | null = null
	let isLoading = false
	let validationErrors: ValidationErrors = {}

	const debouncedSearch = debounce(async () => {
		isLoading = true
		locationResults = await searchLocation(shippingFromInput)
		isLoading = false
	}, 300)

	$: if (browser && shippingFromInput) debouncedSearch(shippingFromInput)

	const hasChanges = createChangeTracker(initialValues)

	$: currentValues = {
		name,
		description,
		currency,
		image: headerImage,
		geohash: geohashOfSelectedGeometry,
		shipping: shippingMethods.map((s) => s.json),
	}

	$: changed = hasChanges(currentValues)

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
		const [lon, lat] = [parseFloat(location.lon), parseFloat(location.lat)]
		const boundingbox = location.boundingbox.map(Number) as [number, number, number, number]
		mapGeoJSON = {
			type: 'Feature',
			geometry: { type: 'Point', coordinates: [lon, lat] },
			properties: {},
			boundingbox: [boundingbox[0], boundingbox[2], boundingbox[1], boundingbox[3]],
		}

		const [minLat, maxLat, minLon, maxLon] = boundingbox
		const centerLat = (minLat + maxLat) / 2
		const centerLon = (minLon + maxLon) / 2
		const accuracy = calculateGeohashAccuracy(boundingbox)
		geohashOfSelectedGeometry = geohash.encode(centerLat, centerLon, accuracy)
		selectedLocation = location
	}

	async function create(event: Event) {
		if (!changed) return
		if (!$ndkStore.activeUser?.pubkey) return

		const identifier = stall?.identifier ?? createSlugId(name)

		isLoading = true
		event.preventDefault()

		const tags: NDKTag[] = [['d', identifier]]
		if (headerImage) tags.push(['image', headerImage])
		if (geohashOfSelectedGeometry) tags.push(['g', geohashOfSelectedGeometry])

		const newEvent = new NDKEvent($ndkStore, {
			kind: KindStalls,
			pubkey: $ndkStore.activeUser.pubkey,
			content: JSON.stringify({
				id: identifier,
				name,
				description,
				currency,
				shipping: shippingMethods.map((s) => s.json),
			}),
			created_at: unixTimeNow(),
			tags,
		})

		try {
			const [publishedEvent, userExists] = await Promise.all([publishEvent(newEvent), checkIfUserExists($ndkStore.activeUser.pubkey)])
			if ((await shouldRegister(allowRegister, userExists)) && publishedEvent) {
				const nostrEvent = await newEvent.toNostrEvent()
				await (stall?.id
					? $updateStallFromNostrEvent.mutateAsync([stall.id, nostrEvent])
					: $createStallFromNostrEvent.mutateAsync(nostrEvent))
			}
			publishedEvent && dispatch('success', null)
		} catch (error) {
			console.error('Error creating or updating stall:', error)
			dispatch('error', error)
		}
		isLoading = false
	}

	onMount(() => {
		if (stall?.geohash) {
			geohashOfSelectedGeometry = stall.geohash
			shippingFromOpen = true
			const { latitude, longitude } = geohash.decode(stall.geohash)
			const boundingbox = geohash.decode_bbox(stall.geohash)

			mapGeoJSON = {
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [longitude, latitude] },
				properties: {},
				boundingbox,
			}

			selectedLocation = {
				place_id: '',
				display_name: `Location at marker (${geohashOfSelectedGeometry} - ${getGeohashAccuracyText(geohashOfSelectedGeometry)})`,
				lat: String(latitude),
				lon: String(longitude),
				boundingbox,
			}
		}
	})

	async function handleSubmit(event: Event) {
		event.preventDefault()
		const formData = {
			id: stall?.identifier ?? createSlugId(name),
			name,
			description,
			currency,
			shipping: shippingMethods,
		}

		validationErrors = validateForm(formData, get(forbiddenPatternStore).createStallEventContentSchema)
		if (Object.keys(validationErrors).length === 0) {
			await create(event)
		} else {
			Object.values(validationErrors).forEach((error) => toast.error(`${error}`))
		}
	}

	async function handleDelete() {
		if (!stall?.id) return
		isLoading = true
		try {
			await $deleteStallMutation.mutateAsync(stall.id)
		} catch (error) {
			console.error('Error deleting stall:', error)
		}
		await deleteEvent(stall.id)
		dispatch('success', null)
		isLoading = false
	}

	function handleLocationUpdated(
		event: CustomEvent<{ lat: number; lon: number; boundingbox: [number, number, number, number]; isDragged: boolean }>,
	) {
		const { lat, lon, boundingbox, isDragged } = event.detail
		const accuracy = calculateGeohashAccuracy(boundingbox)
		geohashOfSelectedGeometry = geohash.encode(lat, lon, accuracy)

		selectedLocation = {
			place_id: isDragged ? 'marker' : '',
			display_name: isDragged
				? `Location at marker (${geohashOfSelectedGeometry} - ${getGeohashAccuracyText(geohashOfSelectedGeometry)})`
				: selectedLocation?.display_name || '',
			lat: String(lat),
			lon: String(lon),
			boundingbox,
		}
	}
</script>

<form class="flex flex-col gap-4 grow" on:submit={handleSubmit}>
	<Collapsible.Root>
		<Collapsible.Trigger asChild let:builder>
			<Button
				data-tooltip="This image helps customers recognize your stall"
				builders={[builder]}
				variant="ghost"
				size="sm"
				class="w-full p-0"
			>
				<Label for="userImage" class="font-bold">Header image (Recommended)</Label>
				<span class="i-ion-chevron-expand" />
			</Button>
		</Collapsible.Trigger>
		<Collapsible.Content>
			<SingleImage src={headerImage} on:save={({ detail }) => (headerImage = detail)} />
		</Collapsible.Content>
	</Collapsible.Root>

	<div class="grid w-full items-center gap-1.5">
		<Label for="title" class="font-bold required-mark">Title</Label>
		<Input
			data-tooltip="Your stall's name"
			bind:value={name}
			required
			class={`border-2 border-black ${validationErrors['name'] ? 'ring-2 ring-red-500' : ''}`}
			type="text"
			name="title"
			placeholder="e.g. Fancy Wears"
		/>
		{#if validationErrors['name']}
			<p class="text-red-500 text-sm mt-1">
				{validationErrors['name'] == 'forbidden_word' ? 'Forbidden word, this is not allowed' : validationErrors['name']}
			</p>
		{/if}
	</div>

	<div class="grid w-full items-center gap-1.5">
		<Label for="description" class="font-bold">Description (Recommended)</Label>
		<Textarea
			data-tooltip="More information on your stall"
			bind:value={description}
			class={`border-2 border-black ${validationErrors['description'] ? 'ring-2 ring-red-500' : ''}`}
			placeholder="Description"
			name="description"
		/>
		{#if validationErrors['description']}
			<p class="text-red-500 text-sm mt-1">{validationErrors['description']}</p>
		{/if}
	</div>

	<Collapsible.Root bind:open={shippingFromOpen} class="flex flex-col gap-2">
		<Collapsible.Trigger asChild let:builder>
			<Button builders={[builder]} variant="ghost" size="sm" class="w-full p-0">
				<Label for="from" class="font-bold">Shipping From (Recommended)</Label>
				<span class="i-ion-chevron-expand" />
			</Button>
		</Collapsible.Trigger>
		<Collapsible.Content class="flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<span
					class="i-mdi-information-outline"
					data-tooltip="Geohash is a compact representation of a geographic coordinate system. It's used to quickly identify the location of a point on a map. The accuracy is the number of characters in the geohash and is determined by your zoom level."
				></span>
				{#if geohashOfSelectedGeometry}
					<small class="text-gray-500">Geohash: {geohashOfSelectedGeometry}</small>
				{:else}
					<small class="text-gray-500">No location selected - click on the map to set a marker or search for a location</small>
				{/if}
			</div>

			<Leaflet geoJSON={mapGeoJSON} on:locationUpdated={handleLocationUpdated} />
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
							{#each locationResults as location (location.place_id)}
								<Command.Item
									value={`${location.display_name}${location.place_id}`}
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
				<Button
					data-tooltip="Products in this stall will use this currency. It would be converted to bitcoin in real time for your users to pay!"
					variant="outline"
					class="border-2 border-black"
					builders={[builder]}>{currency}</Button
				>
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
		<Separator />
		<div class="grid sm:grid-cols-[1fr_1fr_1fr_auto] w-full items-end gap-2">
			<div>
				<Label for={`shipping-name-${i}`} class="font-bold required-mark">{i + 1}. Shipping Name</Label>
				<Input
					required
					bind:value={item.name}
					class={`border-2 border-black ${validationErrors[`shipping.${i}.name`] ? 'ring-2 ring-red-500' : ''}`}
					type="text"
					id={`shipping-name-${i}`}
					placeholder="24/28h Europe"
				/>
				{#if validationErrors[`shipping.${i}.name`]}
					<p class="text-red-500 text-sm mt-1">{validationErrors[`shipping.${i}.name`]}</p>
				{/if}
			</div>
			<div>
				<Label for={`shipping-cost-${i}`} class="font-bold">Base Cost</Label>
				<Input
					data-tooltip="Shipping cost that each product using this method would include!"
					bind:value={item.cost}
					class="border-2 border-black"
					min={0}
					type="text"
					pattern="^(?!.*\.\.)[0-9]*([.][0-9]+)?"
					id={`shipping-cost-${i}`}
					placeholder="e.g. 30"
				/>
				{#if validationErrors[`shipping.${i}.cost`]}
					<p class="text-red-500 text-sm mt-1">{validationErrors[`shipping.${i}.cost`]}</p>
				{/if}
			</div>
			<div>
				<Label for={`shipping-countries-${i}`} class="font-bold">Countries</Label>
				<Popover.Root let:ids>
					<Popover.Trigger asChild let:builder>
						<Button
							data-tooltip="Destinations for this option"
							builders={[builder]}
							variant="outline"
							role="combobox"
							aria-expanded="true"
							class="w-full max-w-full border-2 border-black justify-between truncate"
							disabled={item.countries === null || item.name === 'Local Pickup'}
						>
							{#if item.countries === null}
								All Countries
							{:else if item.countries.length === 0 && item.name === 'Local Pickup'}
								Local Pickup
							{:else if item.countries.length === 0}
								Select
							{:else if item.countries.length <= 2}
								{item.countries.join(', ')}
							{:else}
								{item.countries.slice(0, 2).join(', ')} +{item.countries.length - 2}
							{/if}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-[250px] max-h-[350px] overflow-y-auto p-0">
						<Command.Root>
							<Command.Input placeholder="Search country..." />
							<Command.Empty>No country found.</Command.Empty>
							<Command.Group>
								{#each Object.values(COUNTRIES_ISO).toSorted((a, b) => {
									if (item.countries === null) return 0
									if (item.countries.includes(a.iso3) && item.countries.includes(b.iso3)) return 0
									if (item.countries.includes(a.iso3)) return -1
									if (item.countries.includes(b.iso3)) return 1
									return a.name.localeCompare(b.name)
								}) as country (country.iso3)}
									<Command.Item
										value={`${country.iso3} ${country.name}`}
										onSelect={(currentValue) => {
											const iso3 = currentValue.split(' ')[0]
											if (item.countries && item.countries.includes(iso3)) {
												item.removeCountry(iso3)
											} else {
												item.addCountry(iso3)
											}
											shippingMethods = shippingMethods
											document.getElementById(ids.trigger)?.focus()
										}}
									>
										<div class="flex items-center justify-between w-full">
											<div class="flex items-center gap-2">
												{#if item.countries && item.countries.includes(country.iso3)}
													<span class="i-tdesign-check text-green-500"></span>
												{/if}
												<span class="font-semibold">{country.iso3}</span>
												<span class="text-sm text-gray-600">{country.name}</span>
											</div>
										</div>
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</div>
			<div class="h-full flex flex-col justify-end">
				<div class="flex gap-1" data-testid={`shipping-actions-${i}`}>
					<Button data-tooltip="Copy this method" on:click={() => addShipping(item.id)} variant="outline" class="font-bold border-0 h-full">
						<span class="i-tdesign-copy"></span>
					</Button>
					<Button
						data-tooltip="Remove this method"
						data-testid={`remove-shipping-${i}`}
						on:click={() => removeShipping(item.id)}
						variant="outline"
						class="font-bold text-red-500 border-0 h-full"
					>
						<span class="i-tdesign-delete-1"></span>
					</Button>
				</div>
			</div>
		</div>
	{/each}
	<div class="flex gap-2 justify-end">
		<Button
			data-tooltip="Provide different shipping options for your customers!"
			on:click={() => addShipping()}
			variant="outline"
			class={`font-bold ${!shippingMethods.length ? 'required-mark' : ''}`}>Add Shipping Method</Button
		>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button data-tooltip="Add a predefined shipping template" variant="outline" builders={[builder]} class="font-bold">
					Add from Template
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Label>Shipping Templates</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{#each SHIPPING_TEMPLATES as template}
					<DropdownMenu.Item
						on:click={() => {
							const newMethod = new ShippingMethod(createId(), template.name, template.cost, [], template.countries)
							template.countries?.forEach((country) => newMethod.addCountry(country))
							shippingMethods = [...shippingMethods, newMethod]
						}}
					>
						<div class="flex items-center gap-2">
							<span class="font-semibold">{template.name}</span>
							<span class="text-sm text-gray-600">{template.cost} {currency}</span>
						</div>
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<Button id="stall-save-button" type="submit" disabled={isLoading || !changed || !shippingMethods.length} class="w-full font-bold"
		>Save</Button
	>
	{#if stall?.id}
		<Button type="button" variant="destructive" disabled={isLoading} on:click={handleDelete}>Delete</Button>
	{/if}
</form>
