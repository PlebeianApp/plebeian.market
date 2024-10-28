<script lang="ts">
	import { LightningAddress } from '@getalby/lightning-tools'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { decodePk, resolveQuery } from '$lib/utils'
	import { onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'

	// TODO: Maybe we can pass the whole invoice object as a prop and extend the usage of this component to also show observations about the invoice
	export let paymentDetails: string
	let canBePaid = false
	let isLoading = false

	onMount(async () => {
		isLoading = true
		if (paymentDetails.startsWith('npub')) {
			const user = await resolveQuery(() => createUserByIdQuery(decodePk(paymentDetails)))
			if (user?.lud16) paymentDetails = user.lud16
		}
		// TODO: Maybe we can leverage svelte query to avoid repeated network calls
		const ln = new LightningAddress(paymentDetails)
		await ln.fetch()

		canBePaid = !!ln.lnurlpData
		isLoading = false
	})
</script>

<div class="flex justify-between items-center w-full">
	<div>{paymentDetails}</div>

	<div>
		{#if isLoading}
			<Spinner />
		{:else if canBePaid}
			<span class="i-mdi-check w-6 h-6" data-tooltip="Invoice outstanding but the user can be paid." />
		{:else}
			<span
				class="i-mdi-remove w-6 h-6"
				data-tooltip="Invoice outstanding because the buyer has no possibility to pay. Consider marking this order as paid."
			/>
		{/if}
	</div>
</div>
