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
	import * as Command from '$lib/components/ui/command'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import * as Popover from '$lib/components/ui/popover'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
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
		handleInvalidForm,
		searchLocation,
		shouldRegister,
		unixTimeNow,
	} from '$lib/utils'
	import { deleteEvent, publishEvent } from '$lib/utils/nostr.utils'
	import { validateForm } from '$lib/utils/zod.utils'
	import { ChevronDown, SearchIcon } from 'lucide-svelte'
	import geohash from 'ngeohash'
	import { createEventDispatcher, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import { get } from 'svelte/store'

	import { COUNTRIES_ISO, CURRENCIES } from '@plebeian/database/constants'
	import { createId, createSlugId } from '@plebeian/database/utils'

	import { forbiddenPatternStore } from '../../../schema/nostr-events'
	import Spinner from '../assets/spinner.svelte'
	import Leaflet from '../leaflet/leaflet.svelte'
	import ScrollArea from '../ui/scroll-area/scroll-area.svelte'
	import { activeTab } from '../ui/tabs/constants'

	export let stall: Partial<RichStall> | null = null
	const tabs = ['stall', 'header', 'location', 'shipping'] as const
	let currentTab: (typeof tabs)[number] = tabs[0]
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

	function goToNextTab() {
		const currentIndex = tabs.indexOf(currentTab)
		if (currentIndex < tabs.length - 1) {
			currentTab = tabs[currentIndex + 1]
		}
	}

	function goToPreviousTab() {
		const currentIndex = tabs.indexOf(currentTab)
		if (currentIndex > 0) {
			currentTab = tabs[currentIndex - 1]
		}
	}

	$: shippingFromOpen = geohashOfSelectedGeometry ? true : false

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
			console.error('Error deleting shop:', error)
		}
		await deleteEvent(stall.id)
		dispatch('success', null)
		isLoading = false
	}

	function handleLocationUpdated(
		event: CustomEvent<{ lat: number; lon: number; boundingbox: [number, number, number, number]; isDragged: boolean }>,
	) {
		const { lat, lon, boundingbox, isDragged } = event.detail

		if (isNaN(lat) || isNaN(lon)) {
			console.error('Invalid coordinates received:', { lat, lon })
			return
		}

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

	$: if (shippingFromInput.trim()) {
		locationSearchOpen = true
	}
</script>

<form class="flex flex-col h-full bg-white" on:submit={handleSubmit} on:invalid|capture={handleInvalidForm}>
	<div class="flex-1 overflow-hidden flex flex-col">
		<Tabs.Root bind:value={currentTab} class="flex flex-col h-full">
			<Tabs.List class="flex-none w-full justify-around bg-transparent">
				<Tabs.Trigger value="stall" class={activeTab}>Shop</Tabs.Trigger>
				<Tabs.Trigger value="header" class={activeTab}>Header</Tabs.Trigger>
				<Tabs.Trigger value="location" class={activeTab}>Location</Tabs.Trigger>
				<Tabs.Trigger value="shipping" class={activeTab}>Shipping</Tabs.Trigger>
			</Tabs.List>
			<ScrollArea class="flex-1">
				<Tabs.Content value="stall" class="flex flex-col gap-2">
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
								{validationErrors['name']}
							</p>
						{/if}
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label for="description" class="font-bold">Description (Recommended)</Label>
						<Textarea
							data-tooltip="More information on your shop"
							bind:value={description}
							class={`border-2 border-black ${validationErrors['description'] ? 'ring-2 ring-red-500' : ''}`}
							placeholder="Description"
							name="description"
						/>
						{#if validationErrors['description']}
							<p class="text-red-500 text-sm mt-1">{validationErrors['description']}</p>
						{/if}
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label for="currency" class="font-bold">Choose your local currency</Label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button variant="outline" class="border-2 border-black justify-between" iconPosition="right" builders={[builder]}>
									{currency}
									<ChevronDown slot="icon" class="h-4 w-4" />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-56">
								<DropdownMenu.Label>Choose your local currency</DropdownMenu.Label>
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
				</Tabs.Content>

				<Tabs.Content value="header" class="flex flex-col gap-2">
					<Label for="userImage" class="font-bold">Header image (Recommended)</Label>
					<SingleImage
						forSingle={true}
						src={headerImage}
						index={-1}
						imagesLength={1}
						on:save={({ detail }) => (headerImage = detail.url)}
					/>
				</Tabs.Content>
				<Tabs.Content value="location" class="flex flex-col gap-2">
					<div class="grid w-full items-center gap-1.5">
						<Label for="from" class="font-bold">Shipping From (Recommended)</Label>
						<div class="flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<span
									class="i-mdi-information-outline"
									data-tooltip="Geohash is a compact representation of a geographic coordinate system..."
								/>
								{#if geohashOfSelectedGeometry}
									<small class="text-gray-500">Geohash: {geohashOfSelectedGeometry}</small>
								{:else}
									<small class="text-gray-500">No location selected - click on the map to set a marker or search for a location</small>
								{/if}
							</div>
							<div class="grid grid-cols-[1fr_auto] gap-2">
								<Input type="search" placeholder="Search location..." bind:value={shippingFromInput} />
								<Button
									disabled={!shippingFromInput}
									on:click={() => (locationSearchOpen = !locationSearchOpen)}
									variant="tertiary"
									size="icon"
								>
									{#if isLoading}
										<Spinner />
									{:else}
										<SearchIcon />
									{/if}
								</Button>
							</div>

							<Popover.Root disableFocusTrap={true} openFocus={false} bind:open={locationSearchOpen} let:ids>
								<Popover.Trigger />
								<Popover.Content class="w-popover p-0">
									<Command.Root>
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
							{#if currentTab === 'location'}
								<Leaflet class=" h-[200px] z-0" geoJSON={mapGeoJSON} on:locationUpdated={handleLocationUpdated} />
							{/if}
						</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="shipping" class="flex flex-col gap-2">
					{#each shippingMethods as item, i (item.id)}
						<div class="border rounded p-2 space-y-2">
							<!-- Header with Actions -->
							<div class="flex justify-between items-center">
								<h4 class="font-bold">Method #{i + 1}</h4>
								<div class="flex gap-1">
									<Button variant="ghost" size="icon" class="h-8 w-8" data-tooltip="Copy" on:click={() => addShipping(item.id)}>
										<span class="i-tdesign-copy" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										class="h-8 w-8 text-red-500"
										data-tooltip="Remove"
										on:click={() => removeShipping(item.id)}
									>
										<span class="i-tdesign-delete-1" />
									</Button>
								</div>
							</div>

							<!-- Name -->
							<div class="space-y-1">
								<Label for={`shipping-name-${i}`} class="text-sm required-mark">Name</Label>
								<Input
									required
									bind:value={item.name}
									class={validationErrors[`shipping.${i}.name`] ? 'ring-2 ring-red-500' : ''}
									type="text"
									id={`shipping-name-${i}`}
									placeholder="24/28h Europe"
								/>
								{#if validationErrors[`shipping.${i}.name`]}
									<p class="text-red-500 text-xs">{validationErrors[`shipping.${i}.name`]}</p>
								{/if}
							</div>

							<!-- Cost -->
							<div class="space-y-1">
								<Label for={`shipping-cost-${i}`} class="text-sm">Cost ({currency})</Label>
								<Input
									bind:value={item.cost}
									class="w-full"
									min={0}
									type="text"
									pattern="^(?!.*\.\.)[0-9]*([.][0-9]+)?"
									id={`shipping-cost-${i}`}
									placeholder="0.00"
								/>
								{#if validationErrors[`shipping.${i}.cost`]}
									<p class="text-red-500 text-xs">{validationErrors[`shipping.${i}.cost`]}</p>
								{/if}
							</div>

							<!-- Countries -->
							<div class="space-y-1">
								<Label for={`shipping-countries-${i}`} class="text-sm">Countries</Label>
								<Popover.Root let:ids>
									<Popover.Trigger asChild let:builder>
										<Button
											builders={[builder]}
											variant="outline"
											role="combobox"
											class="w-full h-9 px-3 justify-between"
											disabled={item.countries === null || item.name === 'Local Pickup'}
										>
											<span class="truncate">
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
											</span>
											<ChevronDown class="h-4 w-4 flex-shrink-0" />
										</Button>
									</Popover.Trigger>
									<Popover.Content class="w-[280px] p-0" side="bottom" align="start">
										<Command.Root>
											<Command.Input placeholder="Search country..." class="h-9" />
											<Command.Empty>No country found.</Command.Empty>
											<Command.Group class="max-h-[200px] overflow-auto">
												{#each Object.values(COUNTRIES_ISO).sort((a, b) => {
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
									<Button variant="outline" data-tooltip="Copy this method" on:click={() => addShipping(item.id)} class="font-bold h-full">
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
					<div class="flex flex-col gap-2 mt-2">
						<Button
							id="add-shipping-method"
							variant="outline"
							class={!shippingMethods.length ? 'required-mark' : ''}
							on:click={() => addShipping()}
						>
							Add Shipping Method
						</Button>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button variant="outline" builders={[builder]}>Add from Template</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end" class="w-[200px]">
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
				</Tabs.Content>
			</ScrollArea>
		</Tabs.Root>
	</div>

	<div>
		<div class="flex gap-2 my-4">
			<Button
				id="prev-tab-button"
				variant="outline"
				disabled={isLoading || currentTab === tabs[0]}
				class="w-full font-bold flex items-center gap-2"
				on:click={goToPreviousTab}
			>
				<span class="i-tdesign-arrow-left w-5 h-5"></span>
				Back
			</Button>

			{#if currentTab === tabs[tabs.length - 1]}
				<Button id="save-stall-button" variant="primary" disabled={isLoading || !changed} type="submit" class="w-full font-bold"
					>Save</Button
				>
			{:else}
				<Button id="next-tab-button" variant="primary" disabled={isLoading} class="w-full font-bold" on:click={goToNextTab}>Next</Button>
			{/if}
		</div>

		{#if stall?.id}
			<Button variant="destructive" type="button" class="w-full" disabled={isLoading} on:click={handleDelete}>Delete</Button>
		{/if}
	</div>
</form>
