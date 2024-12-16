<script lang="ts">
	import type { RichStall } from '$lib/server/stalls.service'
	import { setDefaultPaymentMethodForStallMutation } from '$lib/fetch/payments.mutations'
	import { paymentsForStallQuery } from '$lib/fetch/payments.queries'

	import type { PaymentDetailsMethod } from '@plebeian/database'

	import Spinner from '../assets/spinner.svelte'
	import { Button } from '../ui/button'
	import { Label } from '../ui/label'

	export let stall: Partial<RichStall>
	export let paymentDetailsMethod: PaymentDetailsMethod

	$: paymentsForStall = paymentsForStallQuery(stall?.id as string)

	const handleSetDefaultPaymentMethod = async (paymentDetailId: string) => {
		$setDefaultPaymentMethodForStallMutation.mutateAsync({
			paymentDetailId,
			stallId: stall?.id as string,
		})
	}
</script>

<div class="flex flex-col gap-4">
	<Label for="title" class="font-bold">Payment methods</Label>
	{#if $paymentsForStall.isLoading}
		<Spinner />
	{:else if $paymentsForStall.data}
		{#each $paymentsForStall.data as paymentDetail}
			<div class="flex flex-row justify-between items-center border-2 border-black pl-3">
				<div class="flex flex-row gap-2">
					{#if paymentDetail.paymentMethod === paymentDetailsMethod[0]}
						<span class="i-mingcute-lightning-line w-6 h-6" />
						<span class="w-20 text-left font-bold">Lightning</span>
						<span>{paymentDetail.paymentDetails}</span>
					{:else if paymentDetail.paymentMethod === paymentDetailsMethod[1]}
						<span class="i-mingcute-anchor-line w-6 h-6" />
						<span class="w-20 text-left font-bold">Onchain</span>
						<span>{paymentDetail.paymentDetails}</span>
					{:else if paymentDetail.paymentMethod === paymentDetailsMethod[2]}
						<span class="i-tdesign-nut w-6 h-6" />
						<span class="w-20 text-left font-bold">Cashu</span>
						<span>{paymentDetail.paymentDetails}</span>
					{:else if paymentDetail.paymentMethod === paymentDetailsMethod[3]}
						<span class="i-mingcute-question-line w-6 h-6" />
						<span class="w-20 text-left font-bold">Other</span>
						<span>{paymentDetail.paymentDetails}</span>
					{/if}
				</div>
				<div class="flex flex-row gap-2 items-center">
					{#if paymentDetail.isDefault}
						<Button variant="ghost" class="border-none" size="icon">
							<span
								class="i-mdi-star
								text-primary w-6 h-6"
							/>
						</Button>
					{:else}
						<Button variant="ghost" class="border-none" size="icon" on:click={() => handleSetDefaultPaymentMethod(paymentDetail.id)}>
							<span class="i-mdi-star-outline w-6 h-6 cursor-pointer" />
						</Button>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>
