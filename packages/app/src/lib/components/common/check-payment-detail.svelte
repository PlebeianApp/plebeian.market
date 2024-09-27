<script lang="ts">
	import { LightningAddress } from '@getalby/lightning-tools'
	import { onMount } from 'svelte'

	import Spinner from '../assets/spinner.svelte'

	export let paymentDetails: string
	let allowsNostr = false
	let isLoading = false

	onMount(async () => {
		isLoading = true

		const ln = new LightningAddress(paymentDetails)
		await ln.fetch()

		allowsNostr = ln.lnurlpData?.allowsNostr ?? false
		isLoading = false
	})
</script>

<div class="flex justify-between items-center w-full">
	<div>{paymentDetails}</div>

	<div>
		{#if isLoading}
			<Spinner />
		{:else if allowsNostr}
			<span class="i-mdi-check w-6 h-6" data-tooltip="Invoice outstanding but the user can be zapped." />
		{:else}
			<span
				class="i-mdi-remove w-6 h-6"
				data-tooltip="Invoice outstanding because the buyer has no possibility to pay. Consider marking this order as paid."
			/>
		{/if}
	</div>
</div>
