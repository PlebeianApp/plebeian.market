<script lang="ts">
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import { privatePaymentsQuery } from '$lib/fetch/payments.queries'
	import { openDrawerForNewProduct, openDrawerForNewStall, openDrawerForPaymentDetail } from '$lib/stores/drawer-ui'

	import Button from '../ui/button/button.svelte'

	export let stalls: Partial<RichStall>[]
	export let products: Partial<DisplayProduct>[]

	$: hasNoStalls = !stalls.length
	$: hasNoPayments = !$privatePaymentsQuery.data?.length
	$: hasNoProducts = !products.length && stalls.length > 0

	$: alerts = [
		{
			condition: hasNoStalls,
			message: undefined,
			action: openDrawerForNewStall,
			buttonText: 'Open A Stall',
			icon: 'i-tdesign-shop-1',
		},
		{
			condition: hasNoPayments,
			message: undefined,
			action: openDrawerForPaymentDetail,
			buttonText: 'Enable Receiving Payments',
			icon: 'i-mingcute-lightning-line',
		},
		{
			condition: hasNoProducts,
			message: undefined,
			action: openDrawerForNewProduct,
			buttonText: 'Add Product',
			icon: 'i-mdi-package-variant-closed',
		},
	]

	$: currentAlert = alerts.find((alert) => alert.condition)
</script>

{#if currentAlert}
	<div class="flex flex-row justify-center px-8 bg-focus items-center">
		<div class="flex sm:flex-row flex-col items-center text-center justify-center p-2 gap-4 w-full">
			{#if currentAlert.message}
				<span>{currentAlert.message}</span>
			{/if}
			<Button variant="primary" class="gap-2 w-full sm:w-fit" on:click={currentAlert.action}>
				{#if currentAlert.icon}
					<span class={`${currentAlert.icon} w-5 h-5`} />
				{/if}
				<span>{currentAlert.buttonText}</span>
			</Button>
		</div>
	</div>
{/if}
