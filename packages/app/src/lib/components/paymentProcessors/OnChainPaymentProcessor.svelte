<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import QrCode from '@castlenine/svelte-qrcode'
	import { queryClient } from '$lib/fetch/client'
	import { updateOnChainIndexMutation } from '$lib/fetch/wallets.mutations'
	import ndkStore from '$lib/stores/ndk'
	import { copyToClipboard } from '$lib/utils'
	import { deriveAddresses, isExtendedPublicKey } from '$lib/utils/paymentDetails.utils'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { CheckoutPaymentEvent } from '../checkout/types'
	import Button from '../ui/button/button.svelte'

	export let paymentDetail: RichPaymentDetail
	export let amountSats: number
	export let paymentType: string
	const dispatch = createEventDispatcher<{
		paymentComplete: CheckoutPaymentEvent
		paymentExpired: CheckoutPaymentEvent
		paymentCanceled: CheckoutPaymentEvent
	}>()

	function handleSkipPayment() {
		dispatch('paymentCanceled', { paymentRequest: paymentDetail.paymentDetails, proof: null, amountSats, paymentType })
	}

	async function handleSuccessfulPayment(txId: string) {
		// TODO: proof should be txId
		// dispatch('paymentComplete', { paymentRequest: paymentDetail.paymentDetails, proof: null, amountSats, paymentType })
		const result = await $updateOnChainIndexMutation.mutateAsync(paymentDetail.id)

		console.log('Resulting', result)
	}

	// $: addressToDisplay = isExtendedPublicKey(paymentDetail.paymentDetails)
	// 	? $onChainWalletIndexQuery.data?.valueNumeric ? deriveAddresses(paymentDetail.paymentDetails, 0, Number($onChainWalletIndexQuery.data.valueNumeric))![0] : deriveAddresses(paymentDetail.paymentDetails, 0)![0]
	// 	: paymentDetail.paymentDetails

	// $: if (isExtendedPublicKey(paymentDetail.paymentDetails)) addressToDisplay = deriveAddresses(paymentDetail.paymentDetails, 1)![0]
	// else if (paymentDetail.paymentDetails.startsWith('bc1')) addressToDisplay = paymentDetail.paymentDetails

	function handleCopyInvoice() {
		if (paymentDetail.paymentDetails) {
			copyToClipboard(paymentDetail.paymentDetails)
			toast.success('Invoice copied to clipboard')
		}
	}
	$: console.log(paymentDetail)
</script>

<div class="flex flex-col gap-2 items-center">
	<QrCode data={paymentDetail.paymentDetails} logoPath="/logo.svg" />
	<Button variant="secondary" class="flex items-center gap-2" on:click={handleCopyInvoice}>
		<span>{paymentDetail.paymentDetails}</span>
		<span class="i-tdesign-copy" />
	</Button>
</div>
<Button variant="outline" on:click={() => handleSuccessfulPayment('')}>I've already paid</Button>
<Button variant="outline" on:click={handleSkipPayment}>Skip Payment</Button>
