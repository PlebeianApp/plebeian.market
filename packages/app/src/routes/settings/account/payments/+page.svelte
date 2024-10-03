<script lang="ts">
	import PaymentDetailEdit from '$lib/components/settings/paymentDetailCreateEdit.svelte'
	import { privatePaymentsQuery } from '$lib/fetch/payments.queries'
	import ndkStore from '$lib/stores/ndk'

	import type { PaymentDetailsMethod } from '@plebeian/database/constants'
	import { PAYMENT_DETAILS_METHOD } from '@plebeian/database/constants'

	const paymentDetailMethods = Object.values(PAYMENT_DETAILS_METHOD) as PaymentDetailsMethod[]
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-xl">Payment details</h3>
	{#if $privatePaymentsQuery.isLoading}
		<p>Loading...</p>
	{:else if $privatePaymentsQuery.data?.length}
		{#each $privatePaymentsQuery.data ?? [] as paymentDetail (paymentDetail.id)}
			<PaymentDetailEdit {paymentDetail} {paymentDetailMethods} />
		{/each}
		<PaymentDetailEdit {paymentDetailMethods} />
	{:else if !$privatePaymentsQuery.data?.length}
		<PaymentDetailEdit {paymentDetailMethods} showGuidance={true} />
	{/if}
</div>
