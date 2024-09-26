<script lang="ts">
	import PaymentDetailEdit from '$lib/components/settings/paymentDetailCreateEdit.svelte'
	import { paymentsQuery } from '$lib/fetch/payments.queries'

	import type { PaymentDetailsMethod } from '@plebeian/database/constants'
	import { PAYMENT_DETAILS_METHOD } from '@plebeian/database/constants'

	const paymentDetailMethods = Object.values(PAYMENT_DETAILS_METHOD) as PaymentDetailsMethod[]
</script>

<div class="flex flex-col gap-4">
	<h3 class="text-xl">Payment details</h3>

	{#if $paymentsQuery.isLoading}
		<p>Loading...</p>
	{:else}
		{#each $paymentsQuery.data ?? [] as paymentDetail (paymentDetail.id)}
			<PaymentDetailEdit {paymentDetail} {paymentDetailMethods} />
		{/each}
	{/if}

	<PaymentDetailEdit {paymentDetailMethods} />
</div>
