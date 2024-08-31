<script lang="ts">
	import type { CartUser } from '$lib/stores/cart'
	import QrCode from '@castlenine/svelte-qrcode'
	import { Invoice, LightningAddress } from '@getalby/lightning-tools'
	import { NDKEvent } from '@nostr-dev-kit/ndk'
	import { createPaymentsForUserQuery } from '$lib/fetch/payments.queries'
	import { userCartTotalInSats } from '$lib/stores/cart'
	import { currentStep } from '$lib/stores/checkout'
	import ndkStore from '$lib/stores/ndk'
	import { truncateText } from '$lib/utils'
	import { onDestroy } from 'svelte'

	import { INVOICE_STATUS } from '@plebeian/database/constants'
	import { createId } from '@plebeian/database/utils'

	import type { FormInputEvent } from '../ui/input'
	import Button from '../ui/button/button.svelte'
	import Input from '../ui/input/input.svelte'

	export let merchant: CartUser

	$: total = $userCartTotalInSats?.[merchant.pubkey]
	$: paymentDetails = createPaymentsForUserQuery(merchant.pubkey)

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

	async function sendMessage(message: string) {
		const testPubkey = '9e77eabc6b7c575a619ab7ce235b3d99443ff33b8b9d805eacc5ec3a38a48976'
		const recipient = $ndkStore.getUser({ pubkey: testPubkey })
		const dm = new NDKEvent($ndkStore)
		dm.kind = 4
		dm.content = (await $ndkStore.signer?.encrypt(recipient, message)) ?? ''
		dm.tags = [['p', recipient.pubkey]]
		await dm.publish()
	}

	async function sendPaymentDetails() {
		const message = JSON.stringify({
			orderId: '',
			type: 1,
			message: null,
			payment_options: $paymentDetails.data?.map(({ paymentDetails, paymentMethod }) => ({
				method: paymentMethod,
				details: paymentDetails,
			})),
		})
		await sendMessage(message)
	}

	async function sendInvoice() {
		const message = JSON.stringify({
			id: createId(),
			orderId: '',
			method: info?.paymentMethod,
			details: info?.paymentDetails, // e.g chosen btc address, ln invoice, etc
			invoiceStatus: INVOICE_STATUS.PAID, // e.g “pending” (one of the values in INVOICE_STATUS constant)
			proof: '',
		})
		await sendMessage(message)
	}

	async function onPreimageInput(e: FormInputEvent<InputEvent>) {
		paid = (await invoice!.validatePreimage(e.currentTarget.value)) ?? paid
		if (paid) {
			await sendInvoice()
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
