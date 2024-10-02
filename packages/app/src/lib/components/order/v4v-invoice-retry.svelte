<script lang="ts">
	import type { DisplayInvoice } from '$lib/server/invoices.service'
	import { LightningAddress } from '@getalby/lightning-tools'
	import { Button } from '$lib/components/ui/button'
	import { createEventDispatcher, onMount } from 'svelte'

	export let invoice: DisplayInvoice

	const dispatch = createEventDispatcher()

	let canBePaid = false

	async function handleRetryPayment(paymentDetails: string) {
		dispatch('retryPayment', paymentDetails)
	}

	const fetchZapInfo = async () => {
		const ln = new LightningAddress(invoice.paymentDetails)
		await ln.fetch()

		if (!ln.lnurlpData) {
			return
		}

		const min = ln.lnurlpData?.min
		const max = ln.lnurlpData?.max

		canBePaid = Number(invoice.totalAmount) >= min && Number(invoice.totalAmount) <= max
	}

	onMount(() => {
		fetchZapInfo()
	})
</script>

<div class="p-2 bg-white flex justify-between items-center gap-2">
	<div>{invoice.paymentDetails}</div>
	{#if invoice.invoiceStatus !== 'paid' && invoice.invoiceStatus !== 'refunded'}
		{#if canBePaid}
			<Button class="w-32" on:click={() => handleRetryPayment(invoice.paymentDetails)}>Retry</Button>
		{:else}
			<Button
				data-tooltip="This invoice cant pe paid. Wait for the merchant to mark this invoice as paid. "
				class="w-32"
				variant="secondary"
				disabled>Not possible</Button
			>
		{/if}
	{:else}
		<Button class="w-32" variant="secondary" disabled>Done</Button>
	{/if}
</div>
