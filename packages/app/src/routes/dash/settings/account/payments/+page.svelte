<script lang="ts">
	import PaymentDetailEdit from '$lib/components/settings/paymentDetailCreateEdit.svelte'
	import { privatePaymentsQuery } from '$lib/fetch/payments.queries'
</script>

<div class="flex flex-col gap-4">
	{#if $privatePaymentsQuery.isLoading}
		<p>Loading...</p>
	{:else if $privatePaymentsQuery.data?.length}
		{#each $privatePaymentsQuery.data ?? [] as paymentDetail (paymentDetail.id)}
			<PaymentDetailEdit {paymentDetail} />
		{/each}
		<PaymentDetailEdit />
	{:else if !$privatePaymentsQuery.data?.length}
		<PaymentDetailEdit showGuidance={true} />
	{/if}
</div>
