<script lang="ts">
	import type { Category } from '$lib/fetch/products.mutations'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { StallCoordinatesType } from '$lib/stores/drawer-ui'
	import Button from '$lib/components/ui/button/button.svelte'
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import Input from '$lib/components/ui/input/input.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { queryClient } from '$lib/fetch/client'
	import { createProductMutation, deleteProductMutation, editProductMutation } from '$lib/fetch/products.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import ndkStore from '$lib/stores/ndk'
	import { prepareProductData, validateProduct } from '$lib/utils/product.utils'
	import { createEventDispatcher, onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { ProductImage } from '@plebeian/database'
	import { createId } from '@plebeian/database/utils'

	import Spinner from '../assets/spinner.svelte'
	import Separator from '../ui/separator/separator.svelte'
	import MultiImageEdit from './multi-image-edit.svelte'

	const dispatch = createEventDispatcher<{ success: unknown; error: unknown }>()
	export let product: Partial<DisplayProduct> | null = null
	export let forStall: StallCoordinatesType | null = null

	let isLoading = false
	let stall: Partial<RichStall> | null = null
	let categories: Category[] = []
	let images: Partial<ProductImage>[] = []
	let currentShippings: { shipping: Partial<RichShippingInfo> | null; extraCost: string }[] = []

	$: stallsQuery = createStallsByFilterQuery({
		userId: $ndkStore.activeUser?.pubkey,
		pageSize: 999,
	})

	$: currentStallIdentifier = forStall?.split(':')[2] || product?.stallId || $stallsQuery.data?.stalls[0]?.identifier

	$: {
		if ($stallsQuery.data?.stalls.length) {
			stall = $stallsQuery.data.stalls.find((s) => s.identifier === currentStallIdentifier) || $stallsQuery.data.stalls[0]
		}
	}

	$: {
		currentShippings =
			stall?.shipping
				?.filter((s) => product?.shipping?.some((sh) => s.id == sh.shippingId.split(':')[0] || s.id == sh.shippingId))
				.map((s) => ({
					shipping: s,
					extraCost: product?.shipping?.find((sh) => s.id == sh.shippingId.split(':')[0] || s.id == sh.shippingId)?.cost ?? '',
				})) ?? []
	}

	$: sortedImages = [...images].toSorted((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))

	function updateImages(updatedImages: Partial<ProductImage>[]) {
		images = updatedImages
			.map((image, index) => ({ ...image, imageOrder: image.imageOrder ?? index }))
			.sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))
	}

	function handleNewImageAdded(e: CustomEvent<string>) {
		updateImages([...images, { imageUrl: e.detail, imageOrder: images.length }])
	}

	function handleImageRemoved(e: CustomEvent<string>) {
		updateImages(images.filter((image) => image.imageUrl !== e.detail))
	}

	function handleSetMainImage(e: CustomEvent<Partial<ProductImage>>) {
		const mainImage = e.detail
		images = images
			.map((image, index) => ({
				...image,
				imageOrder: image.imageUrl === mainImage.imageUrl ? 0 : index + 1,
			}))
			.sort((a, b) => (a.imageOrder ?? 0) - (b.imageOrder ?? 0))
	}

	function addCategory() {
		categories = [...categories, { key: createId(), name: `category ${categories.length + 1}`, checked: true }]
	}

	async function handleSubmit(sEvent: SubmitEvent, stall: Partial<RichStall> | null) {
		if (!stall) return
		isLoading = true

		try {
			if (!currentShippings.length) {
				throw new Error('Add at least one shipping method')
			}
			for (const [i, shipping] of currentShippings.entries()) {
				if (!shipping.shipping) {
					throw new Error(`Specify a method for shipping item number ${i + 1}`)
				}
			}
			const formData = new FormData(sEvent.currentTarget as HTMLFormElement)
			const shippingData = currentShippings
				.filter((method) => method.shipping !== null && method.shipping.id !== undefined)
				.map((method) => ({
					id: method.shipping!.id!,
					cost: method.extraCost,
				}))

			const productData = prepareProductData(formData, stall, sortedImages, shippingData, product!)
			const validationResult = validateProduct(productData)

			if (!validationResult.success || !validationResult.data) {
				validationResult.errors?.forEach((error) => toast.error(error))
				return
			}

			const categoriesData = categories.filter((c) => c.checked).map((c) => c.name)

			if (product) {
				await $editProductMutation.mutateAsync({ product: validationResult.data, categories: categoriesData })
			} else {
				await $createProductMutation.mutateAsync({ product: validationResult.data, categories: categoriesData })
			}

			toast.success(`Product ${product ? 'updated' : 'created'}!`)
			queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser?.pubkey] })
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
				key: createId(),
				name: categoryName,
				checked: true,
			}))
		}
		if (product?.shipping && stall?.shipping) {
			currentShippings = product.shipping.map((sh) => {
				const stallShipping = stall?.shipping?.find((s) => s.id == sh.shippingId)
				return {
					shipping: stallShipping ?? null,
					extraCost: sh.cost ?? '',
				}
			})
		}
		updateImages(product?.images ?? [])
	})
	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'

	async function handleDelete() {
		if (!product?.id) return
		await $deleteProductMutation.mutateAsync(product.id)
		dispatch('success', null)
	}
</script>

{#if $stallsQuery.isLoading}
	<Spinner />
{:else if !$stallsQuery.data?.stalls.length}
	<div>Creating products needs at least one defined <a class="underline" href="/settings/account/stalls">stall</a></div>
{:else}
	<form on:submit|preventDefault={(sEvent) => handleSubmit(sEvent, stall)} class="flex flex-col gap-4 grow h-full">
		<Tabs.Root value="basic" class="p-4">
			<Tabs.List class="w-full justify-around bg-transparent">
				<Tabs.Trigger value="basic" class={activeTab}>Basic</Tabs.Trigger>
				<Tabs.Trigger value="categories" class={activeTab}>Categories</Tabs.Trigger>
				<Tabs.Trigger data-tooltip="Images help customers recognize your product" value="images" class={activeTab}>Images</Tabs.Trigger>
				<Tabs.Trigger value="shipping" class={`${activeTab} ${!currentShippings.length ? 'required-mark' : ''}`}>Shipping</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="basic" class="flex flex-col gap-2">
				<div class="grid w-full items-center gap-1.5">
					<Label for="title" class="font-bold required-mark">Title</Label>
					<Input
						data-tooltip="Your product's name"
						value={product?.name ?? ''}
						required
						class="border-2 border-black"
						type="text"
						name="title"
						placeholder="e.g. Fancy Wears"
					/>
				</div>

				<div class="grid w-full items-center gap-1.5">
					<Label for="description" class="font-bold">Description (Recommended)</Label>
					<Textarea
						data-tooltip="More information on your product"
						value={product?.description ?? ''}
						class="border-2 border-black"
						placeholder="Description"
						name="description"
					/>
				</div>

				<div class="flex gap-1.5">
					<div class="grid w-full items-center gap-1.5">
						<Label for="price" class="font-bold required-mark">Price</Label>
						<Input
							data-tooltip="The cost of your product"
							class="border-2 border-black"
							min={0}
							type="text"
							pattern="^(?!.*\\.\\.)[0-9]*([.][0-9]+)?"
							name="price"
							placeholder="e.g. $30"
							required
							value={product?.price ?? ''}
						/>
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label title="quantity" for="quantity" class="font-bold required-mark">Quantity</Label>
						<Input
							data-tooltip="The available stock for this product"
							value={product?.quantity ?? ''}
							required
							class="border-2 border-black"
							type="number"
							name="quantity"
							placeholder="10"
						/>
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
									class="border-2 border-black"
									builders={[builder]}
								>
									{#if currentStallIdentifier}
										{@const defaultStall = $stallsQuery.data?.stalls.find((stall) => stall.identifier === currentStallIdentifier)}
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
									{#each $stallsQuery.data?.stalls as item}
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
				<MultiImageEdit
					images={sortedImages}
					on:imageAdded={(e) => handleNewImageAdded(e)}
					on:imageRemoved={(e) => handleImageRemoved(e)}
					on:setMainImage={(e) => handleSetMainImage(e)}
				/>
			</Tabs.Content>

			<Tabs.Content value="shipping" class="flex flex-col gap-2 p-2">
				{#each currentShippings as shippingMethod, i (shippingMethod.shipping?.id)}
					<div class="grid w-full items-center gap-1.5">
						<Label for="stall-shippings" class="font-bold required-mark">Shipping Method #{i + 1}</Label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button variant="outline" class="border-2 border-black" builders={[builder]}>
									{shippingMethod.shipping?.name ?? 'Choose a shipping method'}
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-56">
								<DropdownMenu.Label>Stall</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<section class="max-h-[350px] overflow-y-auto">
									{#each stall?.shipping?.filter((s) => !currentShippings.some((sh) => sh !== shippingMethod && sh.shipping?.id === s.id)) ?? [] as item}
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
						on:click={() => (currentShippings = [...currentShippings, { shipping: null, extraCost: '' }])}
						disabled={currentShippings.length === stall?.shipping?.length}
						variant="outline"
						class={`font-bold ml-auto ${!currentShippings.length ? 'required-mark' : ''}`}>Add Shipping Method</Button
					>
				</div>
			</Tabs.Content>

			<Button disabled={isLoading} type="submit" class="w-full font-bold my-4">Save</Button>
			{#if product?.id}
				<Button type="button" variant="destructive" class="w-full" on:click={handleDelete}>Delete</Button>
			{/if}
		</Tabs.Root>
	</form>
{/if}
