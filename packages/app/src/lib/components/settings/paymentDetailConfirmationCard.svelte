<script lang="ts">
	import type { onChainConfirmationType } from '$lib/components/settings/types'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button'
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card'
	import { ScrollArea } from '$lib/components/ui/scroll-area'
	import { deriveAddresses } from '$lib/utils/paymentDetails.utils'
	import { createEventDispatcher } from 'svelte'

	export let value: string
	export let type: onChainConfirmationType

	const dispatch = createEventDispatcher<{
		confirm: { value: string }
		cancel: void
	}>()

	function handleConfirm() {
		dispatch('confirm', { value })
	}

	function handleCancel() {
		dispatch('cancel')
	}

	$: derivedAddresses = type === 'extended_public_key' ? deriveAddresses(value, 9) : []
</script>

<Card>
	<CardHeader>
		<CardTitle>Confirmation</CardTitle>
	</CardHeader>
	<CardContent>
		<p>
			{#if type === 'extended_public_key'}
				Are you sure you want to persist this extended public key?
			{:else}
				Are you sure you want to persist this address?
			{/if}
		</p>
		<div class="bg-secondary p-2 mt-2">
			<code class="text-sm break-all">{value}</code>
		</div>
		{#if type == 'extended_public_key' && derivedAddresses && derivedAddresses.length > 0}
			<div class="mt-4">
				<h3 class="text-base font-semibold">Derived Addresses:</h3>
				<p>Please check that these addresses match the first 10 addresses in your wallet.</p>
				<ScrollArea class="h-60">
					<div class="p-4">
						{#each derivedAddresses as address, index}
							<div class="bg-secondary px-2 py-1 mb-1 flex items-center">
								<span class="mr-1 text-primary">{index + 1}.</span>
								<span class="text-sm break-all">{address}</span>
							</div>
						{/each}
					</div>
				</ScrollArea>
			</div>
		{:else if type == 'single_address'}
			<Alert.Root variant="destructive">
				<Alert.Description>
					Reusing a single address for each payment has serious privacy implications. Consider using an extended public key (xpub or zpub)
					or an alternative payment method for better privacy.
				</Alert.Description>
			</Alert.Root>
		{/if}
	</CardContent>
	<CardFooter class="flex justify-end space-x-2">
		<Button variant="outline" on:click={handleCancel}>Cancel</Button>
		<Button variant="primary" on:click={handleConfirm}>Confirm</Button>
	</CardFooter>
</Card>
