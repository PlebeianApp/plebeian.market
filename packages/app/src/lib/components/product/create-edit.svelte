<script lang="ts">
	import type { Category } from '$lib/fetch/products.mutations'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { ValidationErrors } from '$lib/utils/zod.utils'
	import Button from '$lib/components/ui/button/button.svelte'
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import Input from '$lib/components/ui/input/input.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { createProductMutation, deleteProductMutation, editProductMutation } from '$lib/fetch/products.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import { openDrawerForNewStall } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'
	import { productFormState } from '$lib/stores/product-form'
	import { handleInvalidForm, parseCoordinatesString } from '$lib/utils'
	import { deleteEvent } from '$lib/utils/nostr.utils'
	import { prepareProductData } from '$lib/utils/product.utils'
	import { validateForm } from '$lib/utils/zod.utils'
	import { ChevronDown } from 'lucide-svelte'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import { get } from 'svelte/store'

	import type { ProductImage } from '@plebeian/database'
	import { createSlugId } from '@plebeian/database/utils'

	import { forbiddenPatternStore } from '../../../schema/nostr-events'
	import Spinner from '../assets/spinner.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MultiImageEdit from './multi-image-edit.svelte'

	const dispatch = createEventDispatcher<{ success: unknown; error: unknown }>()
	export let product: Partial<DisplayProduct> | null = null
	export let forStall: string | null = null
	if (forStall) forStall = parseCoordinatesString(forStall).coordinates || null
	let isLoading = false
	let stall: Partial<RichStall> | null = null
	let categories: Category[] = []
	let images: Partial<ProductImage>[] = []
	let currentShippings: { shipping: Partial<RichShippingInfo> | null; extraCost: string }[] = []
	let validationErrors: ValidationErrors = {}
	const tabs = ['basic', 'categories', 'images', 'shipping'] as const
	let tab: (typeof tabs)[number] = tabs[0] 
	let name = $productFormState?.name || product?.name || ''
	let description = $productFormState?.description || product?.description || ''
	let price = $productFormState?.price || product?.price?.toString() || ''
	let quantity = $productFormState?.quantity || product?.quantity?.toString() || ''

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

	$: {
		currentShippings =
			stall?.shipping
				?.filter((s) => product?.shipping?.some((sh) => s.id == sh.shippingId?.split(':')[0] || s.id == sh.shippingId))
				.map((s) => ({
					shipping: s,
					extraCost: product?.shipping?.find((sh) => s.id == sh.shippingId?.split(':')[0] || s.id == sh.shippingId)?.cost ?? '',
				})) ?? []
	}

	function updateImages(updatedImages: Partial<ProductImage>[]) {
		images = updatedImages.map((image, index) => ({
			...image,
			imageOrder: 'imageOrder' in image ? image.imageOrder : index,
		}))
	}

	$: sortedImages = [...images].sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))

	function handleNewImageAdded(e: CustomEvent<string>) {
		updateImages([...images, { imageUrl: e.detail, imageOrder: images.length }])
	}

	function handleImageRemoved(e: CustomEvent<string>) {
		updateImages(images.filter((image) => image.imageUrl !== e.detail))
	}

	function addCategory() {
		categories = [...categories, { key: createSlugId(`category ${categories.length + 1}`), name: '', checked: true }]

		queueMicrotask(() => {
			const inputs = document.querySelectorAll('input[type="text"]')
			const lastInput = inputs[inputs.length - 1] as HTMLInputElement
			lastInput?.focus()
			lastInput?.select()
		})
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
					cost: method.extraCost,
				}))

			const productData = prepareProductData(formData, stall, sortedImages, shippingData, product!)
			validationErrors = validateForm(productData, get(forbiddenPatternStore).createProductEventSchema)
			if (Object.keys(validationErrors).length > 0) {
				toast.error('Please correct the errors in the form')
				isLoading = false
				return
			}

			const categoriesData = categories.filter((c) => c.checked).map((c) => c.name)

			if (product) {
				await $editProductMutation.mutateAsync({ product: { ...productData }, categories: categoriesData })
			} else {
				await $createProductMutation.mutateAsync({ product: { ...productData }, categories: categoriesData })
			}
			setTimeout(() => {
				productFormState.set(null)
			}, 0)
			dispatch('success', null)
		} catch (error) {
			toast.error(`Failed to ${product ? 'update' : 'create'} product: ${error instanceof Error ? error.message : String(error)}`)
			dispatch('error', error)
		}
		isLoading = false
	}

	onMount(() => {
		if (product?.categories?.length) {
			categories = product.categories.map((categoryName) => ({
				key: createSlugId(categoryName),
				name: categoryName,
				checked: true,
			}))
		}

		if (product?.shipping && stall?.shipping) {
			currentShippings = product.shipping.map((sh) => ({
				shipping: stall?.shipping?.find((s) => s.id == sh.shippingId) ?? null,
				extraCost: sh.cost ?? '',
			}))
		}
		initializeFormState()
	})

	$: if (!isLoading) {
		$productFormState = {
			name,
			description,
			price,
			quantity,
			stallIdentifier: currentStallIdentifier,
			categories: [...categories],
			images: [...images],
			shippings: currentShippings.map((shipping) => ({
				shipping: shipping.shipping ? { ...shipping.shipping } : null,
				extraCost: shipping.extraCost,
			})),
			tab,
		}
	}

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'

	async function handleDelete() {
		if (!product?.id) return
		isLoading = true
		try {
			await $deleteProductMutation.mutateAsync(product.id)
		} catch (error) {
			console.error('Error deleting product:', error)
		}
		await deleteEvent(product.id)
		dispatch('success', null)
		isLoading = false
	}

	function initializeFormState() {
		if (!$productFormState || product) return

		const state = $productFormState
		Object.assign(
			{
				name,
				description,
				price,
				quantity,
				currentStallIdentifier,
				categories,
				images,
				currentShippings,
				tab,
			},
			state,
		)
	}
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
			<Tabs.Root bind:value={tab} class="p-4">
				<Tabs.List class="w-full justify-around bg-transparent">
					<Tabs.Trigger value="basic" class={activeTab}>Basic</Tabs.Trigger>
					<Tabs.Trigger value="categories" class={activeTab}>Categories</Tabs.Trigger>
					<Tabs.Trigger data-tooltip="Images help customers recognize your product" value="images" class={activeTab}>Images</Tabs.Trigger>
					<Tabs.Trigger value="shipping" class={activeTab}>Shipping</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="basic" class="flex flex-col gap-2">
					<div class="grid w-full items-center gap-1.5">
						<Label for="title" class="font-bold required-mark">Title</Label>
						<Input
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
							data-tooltip="More information on your product"
							bind:value={description}
							class={`border-2 border-black ${validationErrors['description'] ? 'ring-2 ring-red-500' : ''}`}
							placeholder="Description"
							name="description"
						/>
						{#if validationErrors['description']}
							<p class="text-red-500 text-sm mt-1">
								{validationErrors['description']}
							</p>
						{/if}
					</div>

					<div class="flex gap-1.5">
						<div class="grid w-full items-center gap-1.5">
							<Label for="price" class="font-bold required-mark">Price<small class="font-light">({stall?.currency})</small></Label>
							<Input
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
					<Button variant="outline" class="w-24" on:click={addCategory}>New</Button>
					<div class="flex flex-col gap-1.5">
						{#each categories as category (category.key)}
							<div class="flex items-center space-x-2">
								<Checkbox id="terms" bind:checked={category.checked} />
								<Input
									bind:value={category.name}
									placeholder="Category name"
									class="border-2 border-black"
									type="text"
									required
									on:keydown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault()
											addCategory()
										}
									}}
								/>
							</div>
						{/each}
					</div>
				</Tabs.Content>

				<Tabs.Content value="images" class="flex flex-col">
					<MultiImageEdit
						images={sortedImages}
						on:imageAdded={(e) => handleNewImageAdded(e)}
						on:imageRemoved={(e) => handleImageRemoved(e)}
						on:imagesReordered={(e) => updateImages(e.detail)}
					/>
				</Tabs.Content>

				<Tabs.Content value="shipping" class="flex flex-col gap-2 p-2">
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
													shippingMethod.shipping = item
													currentShippings = [...currentShippings]
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
									data-tooltip="The cost of the product, which will be added to the method's base cost"
									value={shippingMethod.extraCost}
									on:input={(e) => {
										shippingMethod.extraCost = e.currentTarget.value
										currentShippings = [...currentShippings]
									}}
									required
									class="border-2 border-black"
									type="number"
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
					disabled={isLoading || tab === 'basic'} 
					class="w-full font-bold flex items-center gap-2"
					on:click={() => {
						const currentIndex = tabs.indexOf(tab)
						if (currentIndex > 0) {
							tab = tabs[currentIndex - 1]
						}
					}}
				>
					<span class="i-tdesign-arrow-left w-5 h-5"></span>
					Back
				</Button>
				{#if tab === tabs[tabs.length - 1]}
					<Button variant="primary" disabled={isLoading} type="submit" class="w-full font-bold">Save</Button>
				{:else}
					<Button 
						variant="primary" 
						disabled={isLoading} 
						class="w-full font-bold"
						on:click={() => {
							const currentIndex = tabs.indexOf(tab)
							if (currentIndex < tabs.length - 1) {
								tab = tabs[currentIndex + 1]
							}
						}}
					>
						Next
					</Button>
				{/if}
			</div>
			{#if product?.id}
				<Button variant="destructive" disabled={isLoading} class="w-full" on:click={handleDelete}>Delete</Button>
			{/if}
		</div>
	</form>
{/if}
