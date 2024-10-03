<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js'
	import { createEventDispatcher } from 'svelte'

	import type { OrderMode } from './types'
	import Button from '../ui/button/button.svelte'
	import Label from '../ui/label/label.svelte'

	export let observations: string
	export let isEditing = false
	export let orderMode: OrderMode

	const dispatch = createEventDispatcher<{
		update: string
	}>()

	let editedObservations = observations

	function handleUpdate() {
		dispatch('update', editedObservations)
		isEditing = false
	}

	function handleCancel() {
		editedObservations = observations
		isEditing = false
	}
</script>

<div class="flex flex-col gap-2">
	{#if isEditing}
		<Label class="text-sm">Observations:</Label>

		<Input bind:value={editedObservations} />
		<div class="flex gap-2">
			<Button on:click={handleCancel}>Cancel</Button>
			<Button on:click={handleUpdate}>Update</Button>
		</div>
	{:else}
		<div class="flex items-center justify-between gap-2">
			<Label class="text-sm">Observations:</Label>
			{#if orderMode == 'purchase'}
				<Button variant="ghost" size="icon" on:click={() => (isEditing = true)}><span class="i-mdi-pencil-outline w-5 h-5" /></Button>
			{/if}
		</div>
		<p class="text-sm">{observations}</p>
	{/if}
</div>
