<script lang="ts">
	import type { NDKSubscription } from '@nostr-dev-kit/ndk'
	import type { Category } from '$lib/fetch/products.mutations'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { ProductShippingForm } from '$lib/stores/product-form'
	import type { ValidationErrors } from '$lib/utils/zod.utils'
	import Button from '$lib/components/ui/button/button.svelte'
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte'
	import * as Command from '$lib/components/ui/command/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import Input from '$lib/components/ui/input/input.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { createProductMutation, deleteProductMutation, editProductMutation } from '$lib/fetch/products.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { PRODUCT_FORM_TABS, productFormStore } from '$lib/stores/product-form'
	import { handleInvalidForm, parseCoordinatesString } from '$lib/utils'
	import { deleteEvent } from '$lib/utils/nostr.utils'
	import { prepareProductData } from '$lib/utils/product.utils'
	import { validateForm } from '$lib/utils/zod.utils'
	import { ChevronDown } from 'lucide-svelte'
	import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte'
	import { toast } from 'svelte-sonner'
	import { get } from 'svelte/store'

	import type { ProductImage, ProductShipping } from '@plebeian/database'
	import { createSlugId } from '@plebeian/database/utils'

	import { forbiddenPatternStore } from '../../../schema/nostr-events'
	import Spinner from '../assets/spinner.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import CategoryManager from './category-manager.svelte'
	import MultiImageEdit from './multi-image-edit.svelte'

	const dispatch = createEventDispatcher<{ success: unknown; error: unknown }>()

	export let product: Partial<DisplayProduct> | null = null
	export let forStall: string | null = null

	let isLoading = false
	let stall: Partial<RichStall> | null = null
	let categories: Category[] = []
	let images: Partial<ProductImage>[] = []
	let currentShippings: ProductShippingForm[] = []
	let validationErrors: ValidationErrors = {}
	let name = ''
	let description = ''
	let price = ''
	let quantity = ''

	if (forStall) {
		forStall = parseCoordinatesString(forStall).coordinates || null
	}

	$: stallsQuery = createStallsByFilterQuery({
		userId: $ndkStore.activeUser?.pubkey,
		pageSize: 999,
	})

	$: currentStallIdentifier = forStall?.split(':')[2] || product?.stall_id || $stallsQuery.data?.stalls[0]?.identifier || undefined

	$: {
		if ($stallsQuery.data?.stalls.length) {
			stall = $stallsQuery.data.stalls.find((s) => s.identifier === currentStallIdentifier) || $stallsQuery.data.stalls[0]
		}
	}

	function initializeFormData(product: Partial<DisplayProduct> | null, formState: typeof $productFormStore | null) {
		return {
			name: formState?.name || product?.name || '',
			description: formState?.description || product?.description || '',
			price: formState?.price?.toString() || product?.price?.toString() || '',
			quantity: formState?.quantity?.toString() || product?.quantity?.toString() || '',
			categories: initializeCategories(formState?.categories, product?.categories),
			images: initializeImages(formState?.images, product?.images),
			shippings: initializeShippings(formState?.shippings, product?.shipping),
		}
	}

	function initializeCategories(formCategories?: Category[], productCategories?: string[]) {
		if (formCategories?.length) {
			return formCategories.map((category) => ({
				key: category.key,
				name: category.name,
				checked: true,
			}))
		}

		if (productCategories?.length) {
			return productCategories.map((category) => ({
				key: createSlugId(category),
				name: category,
				checked: true,
			}))
		}

		return []
	}

	function initializeImages(formImages?: Partial<ProductImage>[], productImages?: ProductImage[]) {
		if (formImages?.length) {
			return formImages.map((image) => ({ ...image }))
		}

		if (productImages?.length) {
			return productImages.map((image, index) => ({
				...image,
				imageOrder: image.imageOrder ?? index,
			}))
		}

		return []
	}

	function initializeShippings(formShippings?: ProductShippingForm[], productShippings?: ProductShipping[]): ProductShippingForm[] {
		if (formShippings?.length) {
			return formShippings.map((shipping) => ({
				shipping: shipping.shipping
					? {
							id: shipping.shipping.id,
							name: shipping.shipping.name,
						}
					: null,
				extraCost: shipping.extraCost,
			}))
		}

		if (productShippings?.length && stall?.shipping?.length) {
			return stall.shipping
				.filter(
					(stallShipping): stallShipping is RichShippingInfo =>
						!!stallShipping.id &&
						!!stallShipping.name &&
						productShippings.some((ps) => stallShipping.id === ps.shippingId?.split(':')[0] || stallShipping.id === ps.shippingId),
				)
				.map((stallShipping) => ({
					shipping: {
						id: stallShipping.id,
						name: stallShipping.name,
					},
					extraCost:
						productShippings.find((ps) => stallShipping.id === ps.shippingId?.split(':')[0] || stallShipping.id === ps.shippingId)?.cost ??
						'0',
				}))
		}

		return []
	}

	$: sortedImages = [...images].sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))

	const handleNewImageAdded = (e: CustomEvent<string>) => {
		updateImages([...images, { imageUrl: e.detail, imageOrder: images.length }])
	}

	const handleImageRemoved = (e: CustomEvent<string>) => {
		updateImages(images.filter((image) => image.imageUrl !== e.detail))
	}

	function updateImages(updatedImages: Partial<ProductImage>[]) {
		images = updatedImages.map((image, index) => ({
			...image,
			imageOrder: 'imageOrder' in image ? image.imageOrder : index,
		}))
	}

	function toShippingForm(shipping: Partial<RichShippingInfo>): Pick<RichShippingInfo, 'id' | 'name'> {
		if (!shipping.id || !shipping.name) {
			throw new Error('Invalid shipping info: missing id or name')
		}
		return {
			id: shipping.id,
			name: shipping.name,
		}
	}

	async function handleDelete() {
		if (!product?.id) return
		isLoading = true
		try {
			await $deleteProductMutation.mutateAsync(product.id)
		} catch (error) {
			console.error('Error deleting product:', error)
		}
		await deleteEvent(product.id)
		productFormStore.reset()
		dispatch('success', null)
		isLoading = false
	}

	async function initializeForm() {
		while ($stallsQuery.isLoading) {
			await new Promise((resolve) => setTimeout(resolve, 50))
		}

		if ($stallsQuery.data?.stalls.length) {
			stall = $stallsQuery.data.stalls.find((s) => s.identifier === currentStallIdentifier) || $stallsQuery.data.stalls[0]

			const formData = initializeFormData(product, $productFormStore)
			name = formData.name
			description = formData.description
			price = formData.price
			quantity = formData.quantity
			categories = formData.categories
			images = formData.images
			currentShippings = formData.shippings

			if (forStall) {
				currentStallIdentifier = parseCoordinatesString(forStall).tagD || undefined
			}
		}
	}

	async function handleSubmit(sEvent: SubmitEvent, stall: Partial<RichStall> | null) {
		if (!stall) return
		isLoading = true

		try {
			const formData = new FormData(sEvent.currentTarget as HTMLFormElement)
			const shippingData = currentShippings
				.filter((method) => method.shipping !== null && method.shipping.id !== undefined)
				.map((method) => ({
					id: method.shipping!.id!,
					cost: method.extraCost.toString(),
				}))
			const productData = prepareProductData(formData, stall, sortedImages, shippingData, product!)
			validationErrors = validateForm(productData, get(forbiddenPatternStore).createProductEventSchema)

			const categoriesData = categories.filter((c) => c.name.trim()).map((c) => c.name)

			if (product) {
				await $editProductMutation.mutateAsync({ product: { ...productData }, categories: categoriesData })
			} else {
				await $createProductMutation.mutateAsync({ product: { ...productData }, categories: categoriesData })
			}
			setTimeout(() => {
				productFormStore.reset()
			}, 0)
			dispatch('success', null)
		} catch (error) {
			toast.error(`Failed to ${product ? 'update' : 'create'} product: ${error instanceof Error ? error.message : String(error)}`)
			dispatch('error', error)
		}
		isLoading = false
	}

	onMount(async () => {
		await initializeForm()
	})

	$: {
		if (!isLoading) {
			tick().then(() => {
				productFormStore.update((state) => ({
					...state,
					name,
					description,
					price,
					quantity,
					stallIdentifier: currentStallIdentifier,
					categories: categories.map((category) => ({ ...category })),
					images: images.map((image) => ({ ...image })),
					shippings: currentShippings.map((shipping) => ({
						shipping: shipping.shipping
							? {
									id: shipping.shipping.id,
									name: shipping.shipping.name,
								}
							: null,
						extraCost: shipping.extraCost,
					})),
				}))
			})
		}
	}

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-secondary data-[state=active]:text-secondary'
</script>

{#if $stallsQuery.isLoading}
	<Spinner />
{:else if !$stallsQuery.data?.stalls.length}
	<div>
		Creating products needs at least one defined <Button variant="link" on:click={openDrawerForNewStall} class="p-0">stall</Button>
	</div>
{:else}
	<form
		on:submit|preventDefault={(sEvent) => handleSubmit(sEvent, stall)}
		on:invalid|capture={handleInvalidForm}
		class="flex flex-col justify-between gap-2 h-[calc(100vh-8rem)]"
	>
		<div>
			<Tabs.Root bind:value={$productFormStore.tab}>
				<Tabs.List class="w-full justify-around bg-transparent">
					<Tabs.Trigger value="details" class={activeTab}>Details</Tabs.Trigger>
					<Tabs.Trigger value="categories" class={activeTab}>Categories</Tabs.Trigger>
					<Tabs.Trigger data-tooltip="Images help customers recognize your product" value="images" class={activeTab}>Images</Tabs.Trigger>
					<Tabs.Trigger value="shippings" class={activeTab}>Shippings</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="details" class="flex flex-col gap-2">
					<div class="grid w-full items-center gap-1.5">
						<Label for="title" class="font-bold required-mark">Title</Label>
						<Input
							id="title"
							data-tooltip="Your product's name"
							bind:value={name}
							required
							class={`border-2 border-black ${validationErrors['name'] ? 'ring-2 ring-red-500' : ''}`}
							type="text"
							name="name"
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
							id="description"
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

					<div class="flex gap-1.5">
						<div class="grid w-full items-center gap-1.5">
							<Label for="price" class="font-bold required-mark">Price<small class="font-light">({stall?.currency})</small></Label>
							<Input
								id="price"
								data-tooltip="The cost of your product"
								bind:value={price}
								class={`border-2 border-black ${validationErrors['price'] ? 'ring-2 ring-red-500' : ''}`}
								min={0}
								type="text"
								pattern="^(?!.*\\.\\.)[0-9]*([.][0-9]+)?"
								name="price"
								placeholder="e.g. 30"
								required
							/>
							{#if validationErrors['price']}
								<p class="text-red-500 text-sm mt-1">
									{validationErrors['price']}
								</p>
							{/if}
						</div>

						<div class="grid w-full items-center gap-1.5">
							<Label title="quantity" for="quantity" class="font-bold required-mark">Quantity</Label>
							<Input
								id="quantity"
								data-tooltip="The available stock for this product"
								bind:value={quantity}
								required
								class={`border-2 border-black ${validationErrors['quantity'] ? 'ring-2 ring-red-500' : ''}`}
								type="number"
								name="quantity"
								placeholder="10"
							/>
							{#if validationErrors['quantity']}
								<p class="text-red-500 text-sm mt-1">
									{validationErrors['quantity']}
								</p>
							{/if}
						</div>
					</div>

					<div class="flex gap-1.5">
						<div class="grid w-full items-center gap-1.5">
							<Label for="product-stall" class="font-bold">Stall</Label>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild let:builder>
									<Button
										data-tooltip="The stall this product is part of"
										variant="outline"
										class="border-2 border-black justify-between"
										iconPosition="right"
										builders={[builder]}
									>
										{#if currentStallIdentifier}
											{@const defaultStall = $stallsQuery.data?.stalls.find((stall) => stall.identifier === currentStallIdentifier)}
											{defaultStall ? defaultStall.name : 'Select a stall'}
										{:else}
											{stall?.name}
										{/if}
										<ChevronDown slot="icon" class="h-4 w-4" />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-56">
									<DropdownMenu.Label>Stall</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<section class=" max-h-[350px] overflow-y-auto">
										{#each $stallsQuery.data?.stalls as item (item.id)}
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
							<Label for="product-currency" class="font-bold">Currency</Label>
							<Input
								id="product-currency"
								data-tooltip="This is inherited from the stall's currency"
								value={stall?.currency}
								required
								class="border-2 border-black"
								type="text"
								name="currency"
								disabled
							/>
						</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="categories" class="flex flex-col gap-2">
					<CategoryManager bind:categories />
				</Tabs.Content>

				<Tabs.Content value="images" class="flex flex-col">
					<MultiImageEdit
						images={sortedImages}
						on:imageAdded={(e) => handleNewImageAdded(e)}
						on:imageRemoved={(e) => handleImageRemoved(e)}
						on:imagesReordered={(e) => updateImages(e.detail)}
					/>
				</Tabs.Content>

				<Tabs.Content value="shippings" class="flex flex-col gap-2 p-2">
					{#each currentShippings as shippingMethod, i (shippingMethod.shipping?.id)}
						<div class="grid w-full items-center gap-1.5">
							<Label for="stall-shippings" class="font-bold required-mark">Shipping Method #{i + 1}</Label>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild let:builder>
									<Button variant="outline" iconPosition="right" class=" justify-between" builders={[builder]}>
										{shippingMethod.shipping?.name ?? 'Choose a shipping method'}
										<ChevronDown slot="icon" class="h-4 w-4" />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-56">
									<DropdownMenu.Label>Stall</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<section class="max-h-[350px] overflow-y-auto">
										{#each stall?.shipping?.filter((s) => !currentShippings.some((sh) => sh !== shippingMethod && sh.shipping?.id === s.id)) ?? [] as item (item.id)}
											<DropdownMenu.CheckboxItem
												checked={shippingMethod.shipping?.id === item.id}
												on:click={() => {
													if (item.id && item.name) {
														shippingMethod.shipping = toShippingForm(item)
														currentShippings = [...currentShippings]
													}
												}}
											>
												<div>
													<span class="font-bold">{item.name}</span>, {item.cost}{stall?.currency}
												</div>
											</DropdownMenu.CheckboxItem>
										{/each}
									</section>
								</DropdownMenu.Content>
							</DropdownMenu.Root>

							<div class="grid w-full items-center gap-1.5">
								<Label for="product-extracost" class="font-bold required-mark"
									>Extra cost <small class="font-light">(in {stall?.currency})</small></Label
								>
								<Input
									id="product-extracost"
									data-tooltip="The cost of the product, which will be added to the method's base cost"
									value={shippingMethod.extraCost}
									on:input={(e) => {
										const value = e.currentTarget.value.replace(/[^0-9.]/g, '')
										const sanitizedValue = value.replace(/(\..*)\./g, '$1')
										shippingMethod.extraCost = sanitizedValue
										currentShippings = [...currentShippings]
									}}
									required
									class="border-2 border-black"
									type="text"
									inputmode="decimal"
									pattern="[0-9]*[.]?[0-9]*"
									name="extra"
								/>
								{#if validationErrors[`shipping.${i}.cost`]}
									<p class="text-red-500 text-sm mt-1">{validationErrors[`shipping.${i}.cost`]}</p>
								{/if}
							</div>
						</div>

						<Button
							on:click={() => {
								currentShippings = currentShippings.filter((s) => s !== shippingMethod)
							}}
							variant="outline"
							class="font-bold text-red-500 border-0 h-full"><span class="i-tdesign-delete-1"></span></Button
						>
						<Separator />
					{/each}

					<div class="grid gap-1.5">
						<Button
							data-tooltip={currentShippings.length === stall?.shipping?.length
								? 'Add few shipping methods to the stall first'
								: 'Add shipping methods available for this product'}
							on:click={() => (currentShippings = [...currentShippings, { shipping: null, extraCost: '0' }])}
							disabled={currentShippings.length === stall?.shipping?.length}
							variant="outline"
							class={`font-bold ml-auto`}>Add Shipping Method</Button
						>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
		<div>
			<div class="flex gap-2 my-4">
				<Button
					variant="outline"
					disabled={isLoading || $productFormStore.tab == 'details'}
					class="w-full font-bold flex items-center gap-2"
					on:click={() => productFormStore.previousTab()}
				>
					<span class="i-tdesign-arrow-left w-5 h-5"></span>
					Back
				</Button>
				{#if $productFormStore.tab === PRODUCT_FORM_TABS[PRODUCT_FORM_TABS.length - 1]}
					<Button variant="primary" disabled={isLoading} type="submit" class="w-full font-bold">Save</Button>
				{:else}
					<Button variant="primary" disabled={isLoading} class="w-full font-bold" on:click={() => productFormStore.nextTab()}>Next</Button>
				{/if}
				<!-- TODO: Keep working on manual reset -->
				<!-- <Button variant="outline" size="icon" on:click={() => productFormStore.reset()}>
					<span class=" i-mdi-restore w-5 h-5" />
				</Button> -->
			</div>
			{#if product?.id}
				<Button variant="destructive" disabled={isLoading} class="w-full" on:click={handleDelete}>Delete</Button>
			{/if}
		</div>
	</form>
{/if}
