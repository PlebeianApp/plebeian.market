<script lang="ts">
	import type { Category } from '$lib/fetch/products.mutations'
	import type { DisplayProduct } from '$lib/server/products.service'
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
	import { stallsFilterSchema } from '$lib/schema'
	import ndkStore from '$lib/stores/ndk'
	import { tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { ProductImage } from '@plebeian/database'
	import type { ISO3 } from '@plebeian/database/constants'
	import { COUNTRIES_ISO } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import type { stallEventSchema } from '../../../schema/nostr-events'
	import Spinner from '../assets/spinner.svelte'
	import MultiImageEdit from './multi-image-edit.svelte'

	export let product: DisplayProduct | null = null

	let currentStallId = product?.stallId

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'

	let categories: Category[] = []
	let images: Partial<ProductImage>[] = product?.galleryImages ?? []

	function updateProductImages(updatedProduct: DisplayProduct | null) {
		if (updatedProduct) {
			images = updatedProduct.galleryImages ?? []
		}
	}

	$: updateProductImages(product)

	type Shipping = (typeof stallEventSchema._type)['shipping'][0]

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

	function closeAndFocusTrigger(triggerId: string) {
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}

	async function addCategory() {
		const key = createId()
		categories = [...categories, { key, name: `category ${categories.length + 1}`, checked: true }]
		await tick()
		const el = document.querySelector(`span[data-category-key="${key}"]`) as HTMLSpanElement
		el.focus()
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

	$: stallsQuery = createStallsByFilterQuery(stallsFilterSchema.parse({ userId: $ndkStore.activeUser?.pubkey }))
	$: currentStall = $stallsQuery.data?.find(({ id }) => id === currentStallId)
</script>

{#if $stallsQuery.isLoading}
	<Spinner />
{:else if $stallsQuery.data?.length}
	<form
		on:submit|preventDefault={async (sEvent) => {
			if (!product) {
				const res = await $createProductMutation.mutateAsync([
					sEvent,
					currentStall,
					images.map((image) => image.imageUrl),
					shippingMethods.map((s) => s.json),
					categories,
				])

				console.log(res)
				if (res.error) {
					toast.error(`Failed to create product: ${res.error}`)
				} else {
					toast.success('Product created!')
				}
			} else {
				const res = await $editProductMutation.mutateAsync([
					sEvent,
					product,
					images.map((image) => image.imageUrl),
					shippingMethods.map((s) => s.json),
					categories,
				])

				if (res.error) {
					toast.error(`Failed to update product: ${res.error}`)
				} else {
					toast.success('Product updated!')
				}
			}

			queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser.pubkey] })
		}}
		class="flex flex-col gap-4"
	>
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
						<Input
							value={product?.stockQty ?? ''}
							required
							class="border-2 border-black"
							type="number"
							name="quantity"
							placeholder="10"
							min={1}
						/>
					</div>
				</div>

				<div class="flex gap-1.5">
					<div class="grid w-full items-center gap-1.5">
						<Label for="from" class="font-bold">Stall</Label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button variant="outline" class="border-2 border-black" builders={[builder]}>{currentStall?.name ?? 'Pick a stall'}</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-56">
								<DropdownMenu.Label>Stall</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<section class=" max-h-[350px] overflow-y-auto">
									{#each $stallsQuery.data as item}
										<DropdownMenu.CheckboxItem
											checked={currentStallId === item.id}
											on:click={() => {
												currentStallId = item.id
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
						<Input value={currentStall?.currency} required class="border-2 border-black" type="text" name="currency" disabled />
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
			</Tabs.Content>

			<Button type="submit" class="w-full font-bold my-4">Save</Button>
		</Tabs.Root>
	</form>
{:else if !$stallsQuery.data?.length}
	<p>There should be stalls defined first</p>
{/if}
