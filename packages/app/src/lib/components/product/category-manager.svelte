<script lang="ts">
	import type { Category } from '$lib/fetch/products.mutations'
	import Button from '$lib/components/ui/button/button.svelte'
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte'
	import * as Command from '$lib/components/ui/command/index.js'
	import Input from '$lib/components/ui/input/input.svelte'
	import { categories as categoriesStore, productsSub } from '$lib/nostrSubs/subs'
	import { onMount } from 'svelte'

	import { createSlugId } from '@plebeian/database/utils'

	export let categories: Category[] = []

	let filteredCategories: string[] = []
	let openPopover: { [key: string]: boolean } = {}
	let focusedKey: string | null = null
	let selectedIndex = -1

	onMount(() => {
		productsSub?.ref()
		return () => productsSub?.unref()
	})

	function filterCategories(value: string, key: string) {
		if (value.length >= 3) {
			filteredCategories = $categoriesStore.filter(
				(cat) =>
					cat.toLowerCase().includes(value.toLowerCase()) &&
					!categories.some((existing) => existing.name.toLowerCase() === cat.toLowerCase()),
			)
			openPopover[key] = filteredCategories.length > 0
			selectedIndex = -1
		} else {
			openPopover[key] = false
		}
	}

	function handleKeydown(e: KeyboardEvent, category: Category) {
		if (!openPopover[category.key]) return

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				selectedIndex = (selectedIndex + 1) % filteredCategories.length
				break
			case 'ArrowUp':
				e.preventDefault()
				selectedIndex = selectedIndex <= 0 ? filteredCategories.length - 1 : selectedIndex - 1
				break
			case 'Enter':
				e.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < filteredCategories.length) {
					selectCategory(filteredCategories[selectedIndex], category)
				} else if (filteredCategories.length > 0) {
					selectCategory(filteredCategories[0], category)
				} else {
					addCategory()
				}
				break
			case 'Escape':
				e.preventDefault()
				openPopover[category.key] = false
				break
		}
	}

	function selectCategory(value: string, category: Category) {
		category.name = value
		openPopover[category.key] = false
		categories = [...categories]
		addCategory()
	}

	function addCategory() {
		if (categories.some((cat) => !cat.name.trim())) return
		const newKey = createSlugId(`category ${categories.length + 1}`)
		categories = [...categories, { key: newKey, name: '', checked: true }]

		queueMicrotask(() => {
			const newInput = document.getElementById(`category-name-${newKey}`) as HTMLInputElement
			if (newInput) {
				newInput.focus()
				newInput.select()
			}
		})
	}
</script>

<div class="flex flex-col gap-2">
	<Button variant="outline" class="w-24" on:click={addCategory} disabled={categories.some((cat) => !cat.name.trim())}>New</Button>
	<div class="flex flex-col gap-1.5">
		{#each categories as category (category.key)}
			<div class="flex items-center space-x-2">
				<Checkbox id="terms" bind:checked={category.checked} />
				<div class="relative w-full">
					<Input
						id="category-name-{category.key}"
						bind:value={category.name}
						placeholder="Category name"
						class="border-2 border-black w-full pr-12"
						type="text"
						required
						on:focus={() => (focusedKey = category.key)}
						on:blur={() => (focusedKey = null)}
						on:input={(e) => filterCategories(e.currentTarget.value, category.key)}
						on:keydown={(e) => handleKeydown(e, category)}
					/>
					{#if focusedKey === category.key}
						<div class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
							{category.name.length >= 3 ? filteredCategories.length : $categoriesStore.length}
						</div>
					{/if}
					{#if openPopover[category.key]}
						<div class="absolute w-full z-50 mt-1">
							<Command.Root class="rounded-lg border shadow-md">
								<Command.List>
									<Command.Group>
										{#each filteredCategories as suggestion, i}
											<Command.Item
												value={suggestion}
												onSelect={() => selectCategory(suggestion, category)}
												class="cursor-pointer {selectedIndex === i ? 'bg-gray-100' : ''}"
											>
												{suggestion}
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
