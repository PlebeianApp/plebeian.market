<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { Button } from '$lib/components/ui/button'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import { addForbiddenWordMutation, deleteForbiddenWordMutation } from '$lib/fetch/settingsMeta.mutations.js'
	import { toast } from 'svelte-sonner'

	import type { PageData } from './$types.js'

	let newWord = ''
	export let data
	const linkDetails = data.menuItems.find((item) => item.value === 'app-settings')?.links.find((item) => item.href === $page.url.pathname)

	let isCollapsibleOpen = false

	$: blacklistedWords = ($page.data as PageData).forbiddenWords.forbiddenWords

	async function handleDeleteWord(wordId: string) {
		await $deleteForbiddenWordMutation.mutateAsync(wordId)
		toast.success('Word removed from blacklist successfully!')
	}

	async function handleAddWord() {
		if (newWord.trim()) {
			try {
				await $addForbiddenWordMutation.mutateAsync(newWord.trim())

				toast.success('Word added to blacklist successfully!')
				newWord = ''
				await invalidateAll()
				isCollapsibleOpen = false
			} catch (error) {
				console.error('Failed to add word to blacklist', error)
				toast.error('Failed to add word to blacklist')
			}
		}
	}
</script>

<div class="pb-4 space-y-2 max-w-2xl">
	<div>
		<div class=" flex items-center gap-1">
			<Button size="icon" variant="outline" class=" border-none" on:click={() => goto('/settings/app')}>
				<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
			</Button>
			<section>
				<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
				<p class="text-gray-600">{linkDetails?.description}</p>
			</section>
		</div>
	</div>

	{#if blacklistedWords?.length > 0}
		{#each blacklistedWords as word}
			<div class="flex flex-row items-center justify-between border rounded-md p-2">
				<span class="text-sm">{word.valueText}</span>
				<Button type="button" size="icon" variant="outline" class=" bg-red-500" on:click={() => handleDeleteWord(word.id)}>
					<span class="i-mdi-trash-can" />
				</Button>
			</div>
		{/each}
	{/if}

	<Collapsible.Root bind:open={isCollapsibleOpen}>
		<Collapsible.Trigger asChild let:builder>
			<Button builders={[builder]} variant="outline" class="w-full justify-between">
				Add new blacklisted word
				<span class="i-mdi-plus w-6 h-6" />
			</Button>
		</Collapsible.Trigger>
		<Collapsible.Content>
			<div class="mt-4 space-y-4">
				<Input bind:value={newWord} placeholder="Enter new blacklisted word" />
				<div class="flex justify-end space-x-2">
					<Button variant="outline" on:click={() => (newWord = '')}>Cancel</Button>
					<Button on:click={handleAddWord}>Save</Button>
				</div>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
</div>
