<script lang="ts">
	import type { CheckoutFormData } from '$lib/schema'
	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { checkoutFormSchema } from '$lib/schema'
	import { checkoutFormStore } from '$lib/stores/checkout'
	import { createEventDispatcher, onMount } from 'svelte'

	import { FormLabels } from './types'

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
		observations: '',
	}

	let errors: Partial<Record<keyof CheckoutFormData, string>> = {}

	function validateForm(): boolean {
		const result = checkoutFormSchema.safeParse(formData)
		if (result.success) {
			checkoutFormStore.set(result.data)
			errors = {}
			return true
		} else {
			errors = result.error.issues.reduce(
				(acc, issue) => {
					acc[issue.path[0] as keyof CheckoutFormData] = issue.message
					return acc
				},
				{} as Partial<Record<keyof CheckoutFormData, string>>,
			)
			return false
		}
	}

	function handleSubmit() {
		const isValid = validateForm()
		if (isValid) {
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
	<Label>
		<span class="required-mark">{FormLabels.contactName}</span>
		{#if errors.contactName}<span class="text-red-500">{errors.contactName}</span>{/if}
		<Input type="text" bind:value={formData.contactName} required />
	</Label>
	<Label>
		{FormLabels.contactPhone}
		{#if errors.contactPhone}<span class="text-red-500">{errors.contactPhone}</span>{/if}
		<Input type="tel" bind:value={formData.contactPhone} />
	</Label>
	<Label>
		<span class="required-mark">{FormLabels.contactEmail}</span>
		{#if errors.contactEmail}<span class="text-red-500">{errors.contactEmail}</span>{/if}
		<Input type="email" bind:value={formData.contactEmail} required />
	</Label>
	<Label>
		<span class="required-mark">{FormLabels.address}</span>
		{#if errors.address}<span class="text-red-500">{errors.address}</span>{/if}
		<Input type="text" bind:value={formData.address} required />
	</Label>
	<Label>
		<span class="required-mark">{FormLabels.zip}</span>
		{#if errors.zip}<span class="text-red-500">{errors.zip}</span>{/if}
		<Input type="text" bind:value={formData.zip} required />
	</Label>
	<Label>
		<span class="required-mark">{FormLabels.city}</span>
		{#if errors.city}<span class="text-red-500">{errors.city}</span>{/if}
		<Input type="text" bind:value={formData.city} required />
	</Label>
	<Label>
		<span class="required-mark">{FormLabels.country}</span>
		{#if errors.country}<span class="text-red-500">{errors.country}</span>{/if}
		<Input type="text" bind:value={formData.country} required />
	</Label>
	<Label>
		{FormLabels.region}
		{#if errors.region}<span class="text-red-500">{errors.region}</span>{/if}
		<Input type="text" bind:value={formData.region} />
	</Label>
	<Label>
		{FormLabels.observations}
		{#if errors.observations}<span class="text-red-500">{errors.observations}</span>{/if}
		<Textarea bind:value={formData.observations}></Textarea>
	</Label>
	<Button type="submit" class="w-full mt-6">Finish Review</Button>
</form>
