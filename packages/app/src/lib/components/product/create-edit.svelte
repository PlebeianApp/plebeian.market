<script lang="ts">
	import type { Category } from '$lib/fetch/products.mutations'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { StallIdType } from '$lib/stores/drawer-ui'
	import Button from '$lib/components/ui/button/button.svelte'
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import Input from '$lib/components/ui/input/input.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
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
	import { createId } from '@plebeian/database/utils'

	import Spinner from '../assets/spinner.svelte'
	import MultiImageEdit from './multi-image-edit.svelte'

	export let product: DisplayProduct | null = null
	export let forStall: StallIdType | null = null

	let stalls: RichStall[] | null
	let stall: RichStall | null = null

	$: userExistQuery = createUserExistsQuery($ndkStore.activeUser?.pubkey as string)

	$: stallsQuery = $userExistQuery.data
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser?.pubkey,
			})
		: undefined

	$: {
		if ($stallsQuery?.data) stalls = $stallsQuery.data
	}

	let currentShipping: Partial<RichShippingInfo> | null = null
	let extraCost: string = product?.shipping?.cost ?? ''
	$: {
		currentShipping ??= stall?.shipping.find((s) => s.id === product?.shipping?.shippingId) ?? null
	}

	let currentStallId = forStall ?? product?.stallId

	$: {
		if (stalls?.length) {
			if (currentStallId) {
				;[stall] = stalls.filter((pStall) => pStall.identifier === currentStallId)
			} else {
				stall = stalls[0]
			}
		}
	}

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'

	let categories: Category[] = []
	let images: Partial<ProductImage>[] = product?.images ?? []

	function updateProductImages(updatedProduct: DisplayProduct | null) {
		if (updatedProduct) {
			images = updatedProduct.images ?? []
		}
	}

	$: updateProductImages(product)

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

	onMount(async () => {
		if ($userExistQuery.isFetched && !$userExistQuery.data) {
			const { stallNostrRes } = await fetchUserStallsData($ndkStore.activeUser?.pubkey as string)
			if (stallNostrRes) {
				const normalizedStallData = await Promise.all([...stallNostrRes].map(normalizeStallData)).then((results) =>
					results.filter((result) => result.data !== null).map((result) => result.data),
				)

				if (stalls?.length) {
					const newStalls = normalizedStallData.filter((stall) => !stalls?.some((existingStall) => stall.id === existingStall.id))
					stalls = [...stalls, ...newStalls] as RichStall[]
				} else {
					stalls = normalizedStallData as RichStall[]
				}
			}
		}
	})

	const submit = async (sEvent: SubmitEvent, stall: RichStall | null) => {
		if (stall == null) return
		if (!product) {
			try {
				await $createProductMutation.mutateAsync([
					sEvent,
					stall,
					images.map((image) => ({ imageUrl: image.imageUrl })),
					{ id: currentShipping!.id!, cost: extraCost },
					categories,
				])

				toast.success('Product created!')
			} catch (e) {
				toast.error(`Failed to create product: ${e}`)
			}
		} else {
			try {
				await $editProductMutation.mutateAsync([
					sEvent,
					product,
					images.map((image) => ({ imageUrl: image.imageUrl })),
					{ id: currentShipping!.id!, cost: extraCost },
					categories,
				])
				toast.success('Product updated!')
			} catch (e) {
				toast.error(`Failed to update product: ${e}`)
			}
		}

		queryClient.invalidateQueries({ queryKey: ['products', $ndkStore.activeUser?.pubkey] })
	}
</script>

{#if !stalls || !stalls.length}
	<Spinner />
{:else}
	<form on:submit|preventDefault={(sEvent) => submit(sEvent, stall)} class="flex flex-col gap-4 grow h-full">
		<Tabs.Root value="shipping" class="p-4">
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
							value={product?.quantity ?? ''}
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
								<Button variant="outline" class="border-2 border-black" builders={[builder]}>
									{#if currentStallId}
										{@const defaultStall = stalls.find((stall) => stall.identifier === currentStallId)}
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
				<div class="grid w-full items-center gap-1.5">
					<Label for="from" class="font-bold">Shipping Method</Label>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button variant="outline" class="border-2 border-black" builders={[builder]}>
								{currentShipping?.name ?? 'Choose a shipping method'}
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56">
							<DropdownMenu.Label>Stall</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<section class=" max-h-[350px] overflow-y-auto">
								{#each stall?.shipping ?? [] as item}
									<DropdownMenu.CheckboxItem
										checked={currentShipping === item}
										on:click={() => {
											currentShipping = item
										}}
									>
										{item.name}
									</DropdownMenu.CheckboxItem>
								{/each}
							</section>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<div class="grid w-full items-center gap-1.5">
						<Label for="from" class="font-bold">Extra cost</Label>
						<Input bind:value={extraCost} required class="border-2 border-black" type="text" name="extra" />
					</div>
				</div>
			</Tabs.Content>

			<Button type="submit" class="w-full font-bold my-4">Save</Button>
		</Tabs.Root>
	</form>
{/if}
