<script lang="ts">
	import type { Category } from '$lib/fetch/products.mutations'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichShippingInfo } from '$lib/server/shipping.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { StallCoordinatesType } from '$lib/stores/drawer-ui'
	import { ShippingMethod } from '$lib/classes/shipping'
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
	import Separator from '../ui/separator/separator.svelte'
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

	$: stallsQuery = $userExistQuery.data
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser?.pubkey,
				pageSize: 999,
			})
		: undefined
	$: isLoading = $stallsQuery?.isLoading ?? false

	$: {
		if ($stallsQuery?.data) stalls = $stallsQuery.data.stalls
	}

	let currentShippings: { shipping: Partial<RichShippingInfo> | null; extraCost: string }[] | null = null

	$: {
		currentShippings ??=
			stall?.shipping
				.filter((s) => product?.shipping?.some((sh) => sh.shippingId === s.id))
				.map((s) => ({ shipping: s, extraCost: product?.shipping?.find((sh) => sh.shippingId === s.id)?.cost ?? '' })) ?? null
	}

	$: currentStallIdentifier = forStall?.split(':')[2] || product?.stallId || (stalls && stalls[0]?.identifier)

	$: {
		if (stalls?.length) {
			if (currentStallIdentifier) {
				;[stall] = stalls.filter((pStall) => pStall.identifier === currentStallIdentifier)
			} else {
				stall = stalls[0]
			}
		}
	}

	$: updateProductImages(product)

	function updateProductImages(updatedProduct: Partial<DisplayProduct> | null) {
		if (updatedProduct) {
			images = updatedProduct.images ?? []
		}
	}

	$: updateProductImages(product)

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
				images.map((image) => image.imageUrl!),
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

	const fetchData = async () => {
		$userExistQuery.data == false && (isLoading = true)
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
		isLoading = false
	}

	$: if ($userExistQuery.isFetched) {
		fetchData()
	}

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'

	function closeAndFocusTrigger(triggerId: string) {
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}
</script>

{#if isLoading}
	<Spinner />
{:else if !stalls?.length}
	<div>Creating products needs at least one defined <a class="underline" href="/settings/account/stalls">stall</a></div>
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
						<Label title="quantity" for="quantity" class="font-bold">Quantity</Label>
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
				{#each currentShippings ?? [] as shippingMethod}
					<div class="grid w-full items-center gap-1.5">
						<Label for="from" class="font-bold">Shipping Method</Label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild let:builder>
								<Button variant="outline" class="border-2 border-black" builders={[builder]}>
									{shippingMethod.shipping?.name ?? 'Choose a shipping method'}
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-56">
								<DropdownMenu.Label>Stall</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<section class=" max-h-[350px] overflow-y-auto">
									{#each stall?.shipping.filter((s) => !currentShippings?.some((sh) => sh.shipping?.id === s.id)) ?? [] as item}
										<DropdownMenu.CheckboxItem
											checked={shippingMethod.shipping === item}
											on:click={() => {
												shippingMethod.shipping = item
											}}
										>
											<div>
												<span class=" font-bold">{item.name}</span>, {item.cost}{stall?.currency}
											</div>
										</DropdownMenu.CheckboxItem>
									{/each}
								</section>
							</DropdownMenu.Content>
						</DropdownMenu.Root>

						<div class="grid w-full items-center gap-1.5">
							<Label for="from" class="font-bold">Extra cost <small class="font-light">(in {stall?.currency})</small></Label>
							<Input bind:value={shippingMethod.extraCost} required class="border-2 border-black" type="text" name="extra" />
						</div>
					</div>

					<Button
						on:click={() => (currentShippings = currentShippings?.filter((sh) => sh !== shippingMethod) ?? null)}
						variant="outline"
						class="font-bold text-red-500 border-0 h-full"><span class="i-tdesign-delete-1"></span></Button
					>
					<Separator />
				{/each}

				<div class="grid gap-1.5">
					<Button
						on:click={() => (currentShippings = [...(currentShippings ?? []), { shipping: null, extraCost: '' }])}
						disabled={currentShippings?.length === stall?.shipping.length}
						variant="outline"
						class="font-bold ml-auto">Add Shipping Method</Button
					>
				</div>
			</Tabs.Content>

			<Button type="submit" class="w-full font-bold my-4">Save</Button>
		</Tabs.Root>
	</form>
{/if}
