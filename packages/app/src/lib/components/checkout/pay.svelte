<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import QrCode from '@castlenine/svelte-qrcode'
	import { Invoice, LightningAddress } from '@getalby/lightning-tools'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import { updateOrderMutation, updateOrderStatusMutation } from '$lib/fetch/orders.mutations'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { cart, userCartTotalInSats } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'
	import ndkStore from '$lib/stores/ndk'
	import { sendCheckoutMessage, truncateText } from '$lib/utils'
	import { onDestroy } from 'svelte'

	import { INVOICE_STATUS, ORDER_STATUS } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import type { FormInputEvent } from '../ui/input'
	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'

	export let merchant: CartUser

	$: total = $userCartTotalInSats?.[merchant.pubkey]
	$: paymentDetails = createPaymentsForUserQuery(merchant.pubkey)

	let isLoading = false
	let invoice: Invoice | null = null

	$: info = $paymentDetails.data?.find((info) => info.paymentMethod === 'ln')
	$: (async () => {
		if (info && total) {
			const ln = new LightningAddress(info.paymentDetails)
			await ln.fetch()

			invoice = await ln.requestInvoice({ satoshi: 100 })
			sendPaymentDetails()
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
				markAsPaid(invoice.preimage!)
				await sendInvoice(invoice.preimage!)
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
		const preimage = response.preimage
		paid = true
		if (paid) {
			clearInterval(intervalId)
			markAsPaid(preimage)
			await sendInvoice(preimage)
		}
	}

	function markAsPaid(proof: string) {
		for (const order of Object.values($cart.orders)) {
			if (order.merchant !== merchant.pubkey) {
				continue
			}
			$cart.orders = { ...$cart.orders, [order.id]: { ...order, proof: proof } }
		}
	}

	async function sendPaymentDetails() {
		isLoading = true
		for (const order of Object.values($cart.orders)) {
			if (order.merchant !== merchant.pubkey) {
				continue
			}
			const message = JSON.stringify({
				orderId: order.id,
				type: 1,
				message: null,
				payment_options: $paymentDetails.data?.map(({ paymentDetails, paymentMethod }) => ({
					method: paymentMethod,
					details: paymentDetails,
				})),
			})
			await sendCheckoutMessage(message)
		}
		isLoading = false
	}

	async function sendInvoice(proof: string) {
		isLoading = true
		for (const order of Object.values($cart.orders)) {
			if (order.merchant !== merchant.pubkey) {
				continue
			}
			const message = JSON.stringify({
				id: createId(),
				orderId: order.id,
				method: info?.paymentMethod,
				details: info?.paymentDetails,
				invoiceStatus: INVOICE_STATUS.PAID,
				proof,
			})
			// TODO: create invoice mutation
			await sendCheckoutMessage(message)
			await $updateOrderMutation.mutateAsync([order.id, { status: ORDER_STATUS.PAID }])
		}
		currentStep.set($currentStep + 1)
		isLoading = false
	}

	async function sendCancellation() {
		isLoading = true
		for (const order of Object.values($cart.orders)) {
			if (order.merchant !== merchant.pubkey) {
				continue
			}
			const message = JSON.stringify({
				orderId: order.id,
				type: 2,
				status: ORDER_STATUS.CANCELLED,
			})
			await sendCheckoutMessage(message)
		}
		isLoading = false
	}

	async function onPreimageInput(e: FormInputEvent<InputEvent>) {
		const preimage = e.currentTarget.value
		paid = (await invoice!.validatePreimage(preimage)) ?? paid
		if (paid) {
			await sendInvoice(preimage)
		}
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
				<Button disabled={isLoading} class="flex items-center gap-2" on:click={onWeblnPay}>
					Pay <span class="i-mdi-cash" />
				</Button>
			{/if}
			<Button disabled={isLoading} class="flex items-center gap-2" on:click={() => window.open(url, '_blank')}
				>Open in app <span class="i-mdi-external-link" /></Button
			>

			<Button
				disabled={isLoading}
				variant="ghost"
				class="flex items-center gap-2"
				on:click={async () => {
					await sendCancellation()
					currentStep.set($currentStep + 1)
				}}>Skip <span class="i-mdi-arrow-right" /></Button
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
