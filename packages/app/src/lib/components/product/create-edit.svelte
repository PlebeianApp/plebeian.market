<script lang="ts">
	import type { Category } from '$lib/fetch/products.mutations'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { StallCoordinatesType } from '$lib/stores/drawer-ui'
	import { ShippingMethod } from '$lib/classes/shipping'
	import Button from '$lib/components/ui/button/button.svelte'
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte'
	import * as Command from '$lib/components/ui/command/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import Input from '$lib/components/ui/input/input.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import * as Popover from '$lib/components/ui/popover/index.js'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { queryClient } from '$lib/fetch/client'
	import { createProductMutation, editProductMutation } from '$lib/fetch/products.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { createUserExistsQuery } from '$lib/fetch/users.queries'
	import { fetchUserStallsData, normalizeStallData } from '$lib/nostrSubs/utils'
	import ndkStore from '$lib/stores/ndk'
	import { onMount, tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { ProductImage } from '@plebeian/database'
	import { COUNTRIES_ISO } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import Spinner from '../assets/spinner.svelte'
	import MultiImageEdit from './multi-image-edit.svelte'

	export let product: Partial<DisplayProduct> | null = null
	export let forStall: StallCoordinatesType | null = null
	// TODO Categories are beign inserted in the db but they are not beign loaded when tring to edit/update a product

	let stalls: RichStall[] | null = null
	let stall: RichStall | null = null
	let categories: Category[] = []
	let images: Partial<ProductImage>[] = []
	let shippingMethods: ShippingMethod[] = []

	$: userExistQuery = createUserExistsQuery($ndkStore.activeUser?.pubkey as string)
	$: stallsQuery = $userExistQuery.data ? createStallsByFilterQuery({ userId: $ndkStore.activeUser?.pubkey }) : undefined

	$: if ($stallsQuery?.data) stalls = $stallsQuery.data

	$: {
		if (stalls?.length) {
			stall = stalls.find((s) => s.identifier == currentStallIdentifier) || stalls[0]
		}
	}

	$: currentStallIdentifier = forStall?.split(':')[2] || product?.stallId || (stalls && stalls[0].identifier)

	$: updateProductImages(product)

	function updateProductImages(updatedProduct: Partial<DisplayProduct> | null) {
		if (updatedProduct) {
			images = updatedProduct.images ?? []
		}
	}

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

	function handleNewImageAdded(e: CustomEvent) {
		images = [
			...images,
			{
				imageUrl: e.detail,
			},
		]
	}

	function handleImagRemoved(e: CustomEvent) {
		images = images.filter((image) => image.imageUrl !== e.detail)
	}

	function addCategory() {
		const key = createId()
		categories = [...categories, { key, name: `category ${categories.length + 1}`, checked: true }]
	}

	async function handleSubmit(sEvent: SubmitEvent, stall: RichStall | null) {
		if (!stall) return
		try {
			const mutationFn = product ? $editProductMutation : $createProductMutation
			await mutationFn.mutateAsync([
				sEvent,
				product ?? stall,
				images.map((image) => ({ imageUrl: image.imageUrl })),
				shippingMethods.map((s) => ({
					id: s.id,
					name: s.name ?? '',
					cost: s.cost ?? '',
					regions: s.regions ?? [],
					countries: s.countries ?? [],
				})),
				categories,
			])

			toast.success(`Product ${product ? 'updated' : 'created'}!`)
			queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser?.pubkey] })
		} catch (error) {
			toast.error(`Failed to ${product ? 'update' : 'create'} product: ${error}`)
		}
	}

	onMount(async () => {
		if ($userExistQuery.isFetched && !$userExistQuery.data) {
			const { stallNostrRes } = await fetchUserStallsData($ndkStore.activeUser?.pubkey as string)
			if (stallNostrRes) {
				const normalizedStallData = await Promise.all([...stallNostrRes].map(normalizeStallData)).then((results) =>
					results.filter((result) => result.data !== null).map((result) => result.data),
				)

				if (stalls?.length) {
					const newStalls = normalizedStallData.filter(
						(stall) => !stalls?.some((existingStall) => stall?.identifier === existingStall.identifier),
					)
					stalls = [...stalls, ...newStalls] as RichStall[]
				} else {
					stalls = normalizedStallData as RichStall[]
				}
			}
		}
	})

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'

	function closeAndFocusTrigger(triggerId: string) {
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}
</script>

{#if !stalls || !stalls.length}
	<Spinner />
{:else}
	<form on:submit|preventDefault={(sEvent) => handleSubmit(sEvent, stall)} class="flex flex-col gap-4 grow h-full">
		<Tabs.Root value="basic" class="p-4">
			<Tabs.List class="w-full justify-around bg-transparent">
				<Tabs.Trigger value="basic" class={activeTab}>Basic</Tabs.Trigger>
				<Tabs.Trigger value="categories" class={activeTab}>Categories</Tabs.Trigger>
				<Tabs.Trigger value="images" class={activeTab}>Images</Tabs.Trigger>
				<Tabs.Trigger value="shipping" class={activeTab}>Shipping</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="basic" class="flex flex-col gap-2">
				<div class="grid w-full items-center gap-1.5">
					<Label for="title" class="font-bold">Title</Label>
					<Input
						value={product?.name ?? ''}
						required
						class="border-2 border-black"
						type="text"
						name="title"
						placeholder="e.g. Fancy Wears"
					/>
				</div>

				<div class="grid w-full items-center gap-1.5">
					<Label for="description" class="font-bold">Description (Optional)</Label>
					<Textarea value={product?.description ?? ''} class="border-2 border-black" placeholder="Description" name="description" />
				</div>

				<div class="flex gap-1.5">
					<div class="grid w-full items-center gap-1.5">
						<Label for="price" class="font-bold">Price</Label>
						<Input
							class="border-2 border-black"
							min={0}
							type="text"
							pattern="^(?!.*\\.\\.)[0-9]*([.][0-9]+)?"
							name="price"
							placeholder="e.g. $30"
							value={product?.price ?? ''}
						/>
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label for="quantity" class="font-bold">Quantity</Label>
						<Input value={product?.quantity ?? ''} required class="border-2 border-black" type="number" name="quantity" placeholder="10" />
					</div>
				</div>

				<div class="flex gap-1.5">
					<div class="grid w-full items-center gap-1.5">
						<Label for="from" class="font-bold">Stall</Label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button variant="outline" class="border-2 border-black" builders={[builder]}>
									{#if currentStallIdentifier}
										{@const defaultStall = stalls.find((stall) => stall.identifier === currentStallIdentifier)}
										{defaultStall ? defaultStall.name : 'Select a stall'}
									{:else}
										{stall?.name}
									{/if}
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-56">
								<DropdownMenu.Label>Stall</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<section class=" max-h-[350px] overflow-y-auto">
									{#each stalls as item}
										<DropdownMenu.CheckboxItem
											checked={currentStallIdentifier === item.identifier}
											on:click={() => {
												currentStallIdentifier = item.identifier
											}}
										>
											{item.name}
										</DropdownMenu.CheckboxItem>
									{/each}
								</section>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
					<div class="grid w-full items-center gap-1.5">
						<Label for="from" class="font-bold">Currency</Label>
						<Input value={stall?.currency} required class="border-2 border-black" type="text" name="currency" disabled />
					</div>
				</div>
			</Tabs.Content>

			<Tabs.Content value="categories" class="flex flex-col gap-2">
				<Button variant="outline" class="w-24" on:click={addCategory}>New</Button>
				<div class="flex flex-col gap-1.5">
					{#each categories as category (category.key)}
						<div class="flex items-center space-x-2">
							<Checkbox id="terms" bind:checked={category.checked} />
							<span
								data-category-key={category.key}
								class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								contenteditable="true"
								bind:textContent={category.name}
							>
								{category.name}
							</span>
						</div>
					{/each}
				</div>
			</Tabs.Content>

			<Tabs.Content value="images" class="flex flex-col">
				<MultiImageEdit {images} on:imageAdded={(e) => handleNewImageAdded(e)} on:imageRemoved={(e) => handleImagRemoved(e)} />
			</Tabs.Content>

			<Tabs.Content value="shipping" class="flex flex-col gap-2 p-2">
				{#each shippingMethods as item, i}
					<div class="grid grid-cols-[1fr_1fr_1fr_auto] w-full items-start gap-2">
						<div>
							<Label for="shipping" class="font-bold">{i + 1}. Shipping Name</Label>
							<Input
								required
								bind:value={item.name}
								class="border-2 border-black"
								type="text"
								name="shipping"
								placeholder="24/28h Europe"
							/>
						</div>
						<div>
							<Label for="cost" class="font-bold">Base Cost</Label>
							<Input
								bind:value={item.cost}
								class="border-2 border-black"
								min={0}
								type="text"
								pattern="^(?!.*\\.\\.)[0-9]*([.][0-9]+)?"
								name="cost"
								placeholder="e.g. $30"
							/>
						</div>

						<div>
							<!-- FIXME: not working -->
							<Label class="font-bold">Zones</Label>
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
																item.removeCountry(currentValue)
															} else {
																item.addCountry(currentValue)
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
			</Tabs.Content>

			<Button type="submit" class="w-full font-bold my-4">Save</Button>
		</Tabs.Root>
	</form>
{/if}
