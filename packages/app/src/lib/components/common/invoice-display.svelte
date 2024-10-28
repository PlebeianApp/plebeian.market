<script lang="ts">
	import type { DisplayInvoice } from '$lib/server/invoices.service'
	import { formatSats, getInvoiceStatusColor } from '$lib/utils'

	export let invoice: Pick<DisplayInvoice, 'id' | 'type' | 'invoiceStatus' | 'totalAmount' | 'createdAt'>
</script>

<div class="flex justify-between items-start">
	<div class="flex flex-col">
		<span class="text-sm font-medium text-gray-500 uppercase">{invoice.type}</span>
		<span class="font-medium">Invoice ID: {invoice.id}</span>
		<span class="capitalize font-medium {getInvoiceStatusColor(invoice.invoiceStatus)}">
			{invoice.invoiceStatus}
		</span>
	</div>
	<div class="flex flex-col text-sm text-right">
		<span class="font-bold text-lg">{formatSats(parseFloat(invoice.totalAmount))} sats</span>
		<span class="text-gray-600">{invoice.createdAt}</span>
	</div>
</div>
