<script lang="ts">
	import type { CheckoutFormData } from '$lib/schema'
	import type { ValidationErrors } from '$lib/utils/zod.utils'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { checkoutFormSchema } from '$lib/schema'
	import { checkoutFormStore } from '$lib/stores/checkout'
	import { validateForm } from '$lib/utils/zod.utils'
	import { createEventDispatcher, onMount } from 'svelte'

	import { FormLabels } from './types'

	export let isLocalPickup = false

	const dispatch = createEventDispatcher<{
		validate: { valid: boolean }
	}>()

	let formData: CheckoutFormData = {
		contactName: '',
		contactPhone: '',
		contactEmail: '',
		address: '',
		zip: '',
		city: '',
		country: '',
		region: '',
		additionalInfo: '',
	}

	$: if (isLocalPickup) {
		formData.additionalInfo = 'Local Pickup'
	} else {
		formData.country = ''
		formData.zip = ''
		formData.city = ''
		formData.address = ''
		formData.contactName = ''
		formData.contactPhone = ''
		formData.additionalInfo = ''
	}

	let validationErrors: ValidationErrors = {}

	function handleSubmit() {
		validationErrors = isLocalPickup ? {} : validateForm(formData, checkoutFormSchema)
		if (Object.keys(validationErrors).length === 0) {
			checkoutFormStore.set(formData)
			dispatch('validate', { valid: true })
		}
	}

	onMount(() => {
		if ($checkoutFormStore) {
			formData = $checkoutFormStore
		}
	})
</script>

<form on:submit|preventDefault={handleSubmit}>
	{#if isLocalPickup}
		<div class="flex flex-col gap-2 mb-4">
			<h3>Local Pickup</h3>
			<span class="text-gray-500">No need for an address. You can optionally provide name, email address and/or phone number.</span>
		</div>
	{/if}

	<Label>
		<span class={isLocalPickup ? '' : 'required-mark'}>{FormLabels.contactName}</span>
		{#if validationErrors.contactName}<span class="text-red-500">{validationErrors.contactName}</span>{/if}
		<Input type="text" bind:value={formData.contactName} />
	</Label>
	<Label>
		{FormLabels.contactPhone}
		{#if validationErrors.contactPhone}<span class="text-red-500">{validationErrors.contactPhone}</span>{/if}
		<Input type="tel" bind:value={formData.contactPhone} />
	</Label>
	<Label>
		<span>{FormLabels.contactEmail}</span>
		{#if validationErrors.contactEmail}<span class="text-red-500">{validationErrors.contactEmail}</span>{/if}
		<Input type="email" bind:value={formData.contactEmail} />
	</Label>

	{#if !isLocalPickup}
		<Separator />

		<Label>
			<span class="required-mark">{FormLabels.address}</span>
			{#if validationErrors.address}<span class="text-red-500">{validationErrors.address}</span>{/if}
			<Input type="text" bind:value={formData.address} />
		</Label>
		<Label>
			<span class="required-mark">{FormLabels.zip}</span>
			{#if validationErrors.zip}<span class="text-red-500">{validationErrors.zip}</span>{/if}
			<Input type="text" bind:value={formData.zip} />
		</Label>
		<Label>
			<span class="required-mark">{FormLabels.city}</span>
			{#if validationErrors.city}<span class="text-red-500">{validationErrors.city}</span>{/if}
			<Input type="text" bind:value={formData.city} />
		</Label>
		<Label>
			<span class="required-mark">{FormLabels.country}</span>
			{#if validationErrors.country}<span class="text-red-500">{validationErrors.country}</span>{/if}
			<Input type="text" bind:value={formData.country} />
		</Label>
		<Label>
			{FormLabels.region}
			{#if validationErrors.region}<span class="text-red-500">{validationErrors.region}</span>{/if}
			<Input type="text" bind:value={formData.region} />
		</Label>
	{/if}

	<Separator />

	<Label>
		{FormLabels.additionalInfo}
		{#if validationErrors.additionalInfo}<span class="text-red-500">{validationErrors.additionalInfo}</span>{/if}
		<Textarea bind:value={formData.additionalInfo}></Textarea>
	</Label>
	<Button type="submit" class="w-full mt-6">Finish Review</Button>
</form>
