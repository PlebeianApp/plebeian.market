<!-- src/components/CheckoutForm.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import { currentStep } from '$lib/stores/checkout'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let address = ''
	let zip = ''
	let city = ''
	let country = ''
	let region = ''
	let contactName = ''
	let contactPhone = ''
	let contactEmail = ''
	let observations = ''

	function handleSubmit() {
		dispatch('submit', {
			address,
			zip,
			city,
			country,
			region,
			contactName,
			contactPhone,
			contactEmail,
			observations,
		})
		currentStep.set($currentStep + 1)
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<Label class="required-mark">
		Name:
		<Input type="text" bind:value={contactName} required />
	</Label>
	<Label>
		Phone:
		<Input type="tel" bind:value={contactPhone} />
	</Label>
	<Label>
		Email:
		<Input type="email" bind:value={contactEmail} />
	</Label>
	<Label class="required-mark">
		Address:
		<Input type="text" bind:value={address} required />
	</Label>
	<Label class="required-mark">
		ZIP:
		<Input type="text" bind:value={zip} required />
	</Label>
	<Label class="required-mark">
		City:
		<Input type="text" bind:value={city} required />
	</Label>
	<Label class="required-mark">
		Country:
		<Input type="text" bind:value={country} required />
	</Label>
	<Label>
		Region:
		<Input type="text" bind:value={region} />
	</Label>
	<Label>
		Observations:
		<Textarea bind:value={observations}></Textarea>
	</Label>
	<Button type="submit" class="w-full mt-6">Finish Review</Button>
</form>
