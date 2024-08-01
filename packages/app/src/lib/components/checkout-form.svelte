<!-- src/components/CheckoutForm.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
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
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<Label>
		Address:
		<Input type="text" bind:value={address} required />
	</Label>
	<Label>
		ZIP:
		<Input type="text" bind:value={zip} required />
	</Label>
	<Label>
		City:
		<Input type="text" bind:value={city} required />
	</Label>
	<Label>
		Country:
		<Input type="text" bind:value={country} required />
	</Label>
	<Label>
		Region:
		<Input type="text" bind:value={region} />
	</Label>
	<Label>
		Contact Name:
		<Input type="text" bind:value={contactName} required />
	</Label>
	<Label>
		Contact Phone:
		<Input type="tel" bind:value={contactPhone} />
	</Label>
	<Label>
		Contact Email:
		<Input type="email" bind:value={contactEmail} />
	</Label>
	<Label>
		Observations:
		<Textarea bind:value={observations}></Textarea>
	</Label>

	<Button type="submit">Submit</Button>
</form>
