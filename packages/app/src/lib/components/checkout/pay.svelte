<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import QrCode from '@castlenine/svelte-qrcode'
	import { Invoice, LightningAddress } from '@getalby/lightning-tools'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart, userCartTotalInSats } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'
	import { truncateText } from '$lib/utils'
	import { onDestroy } from 'svelte'
	import { derived } from 'svelte/store'

	import type { FormInputEvent } from '../ui/input'
	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'

	export let merchant: CartUser

	$: total = $userCartTotalInSats?.[merchant.pubkey]
	$: paymentDetails = createPaymentsForUserQuery(merchant.pubkey)

	let invoice: Invoice | null = null

	$: (async () => {
		const info = $paymentDetails.data?.find((info) => info.paymentMethod === 'ln')
		if (info && total) {
			const ln = new LightningAddress(info.paymentDetails)
			await ln.fetch()

			invoice = await ln.requestInvoice({ satoshi: total })
		}
	})()

	$: url = 'lightning://' + invoice?.paymentRequest

	let paid = false
	let intervalId: number

	$: if (invoice) {
		const checkPayment = async () => {
			if (invoice?.verify) {
				paid = await invoice.isPaid()
				if (paid) clearInterval(intervalId)
			}
		}

		intervalId = window.setInterval(checkPayment, 1000)
		checkPayment()
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId)
	})

	async function onWeblnPay() {
		await window.webln!.enable()
		const response = await window.webln!.sendPayment(invoice!.paymentRequest)
		paid = (await invoice?.validatePreimage(response.preimage)) ?? paid
		if (paid) clearInterval(intervalId)
	}

	async function onPreimageInput(e: FormInputEvent<InputEvent>) {
		paid = (await invoice!.validatePreimage(e.currentTarget.value)) ?? paid
	}
</script>

{#if invoice}
	<div class="w-1/2 mx-auto flex flex-col gap-4">
		<span class="mx-auto">Payment expiry date: {invoice.expiryDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
		<div class="mx-auto flex gap-2">
			<Button variant="ghost" class="truncate">{truncateText(invoice.paymentRequest, 30)}</Button>
			<Button on:click={() => navigator.clipboard.writeText(invoice?.paymentRequest ?? '')}><span class="i-tdesign-copy" /></Button>
		</div>
		<div class="flex justify-center">
			<QrCode data={url} logoPath="/logo.svg" />
		</div>
		<Input placeholder="preimage..." on:input={onPreimageInput} />

		<div class="flex gap-2 mx-auto">
			{#if window.webln}
				<Button class="flex items-center gap-2" on:click={onWeblnPay}>
					Pay <span class="i-mdi-cash" />
				</Button>
			{/if}
			<Button class="flex items-center gap-2" on:click={() => window.open(url, '_blank')}
				>Open in app <span class="i-mdi-external-link" /></Button
			>

			<Button variant="ghost" class="flex items-center gap-2" on:click={() => currentStep.set($currentStep + 1)}
				>Skip <span class="i-mdi-arrow-right" /></Button
			>
		</div>
		{#if paid}
			<span class="mx-auto text-green-500">Payment successful</span>
		{/if}
	</div>
{:else}
	<div class="w-1/2 mx-auto flex flex-col gap-4">
		<span class="mx-auto">Waiting for invoice...</span>
	</div>
{/if}
