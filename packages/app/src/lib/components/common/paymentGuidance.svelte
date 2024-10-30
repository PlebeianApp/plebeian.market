<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button'
	import { Checkbox } from '$lib/components/ui/checkbox'
	import { Label } from '$lib/components/ui/label'
	import ndkStore from '$lib/stores/ndk'
	import { npubEncode } from 'nostr-tools/nip19'
	import { createEventDispatcher } from 'svelte'

	import { PAYMENT_DETAILS_METHOD } from '@plebeian/database/constants'

	export let userLightningAddress: string | undefined

	const dispatch = createEventDispatcher()
	//TODO: seems that npub.cash addresses are not working well
	let hasAcceptedTerms: boolean = false
	let checked: boolean = false
	function setupPaymentDetail(paymentDetails: string, method: typeof PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK) {
		dispatch('setupPaymentDetail', { paymentDetails, method })
	}

	function closeGuidance() {
		dispatch('closeGuidance')
	}

	function handlePaste() {
		dispatch('paste')
	}
</script>

<div class="space-y-4">
	{#if !hasAcceptedTerms}
		<h3 class="text-lg font-semibold">Set Up Your First Payment Method</h3>
		<p>This will allow customers to purchase your products without you needing to be online.</p>

		<Alert.Root variant="destructive">
			<Alert.Description>
				PlebianMarket is not responsible for disputes between you and your customers. Please review our terms and conditions.
			</Alert.Description>
		</Alert.Root>

		<div class="flex items-center space-x-2">
			<Checkbox id="terms" bind:checked />
			<Label for="terms" class="text-sm">I accept the terms and conditions</Label>
		</div>

		<Button on:click={() => (hasAcceptedTerms = true)} disabled={!checked}>Continue</Button>
	{:else}
		<h3 class="text-lg font-semibold">Choose Your Payment Method</h3>

		{#if userLightningAddress}
			<div class="bg-secondary p-4 rounded-md">
				<p>We've detected a Lightning address linked to your profile:</p>
				<p class="font-bold text-primary">{userLightningAddress}</p>
				<p>Would you like to use this as your payment method?</p>
			</div>

			<div class="flex space-x-2">
				<Button on:click={() => setupPaymentDetail(userLightningAddress, PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK)}>
					Use This Address
				</Button>
				<Button variant="outline" on:click={closeGuidance}>Set Up Manually</Button>
			</div>
		{:else}
			{@const npubCashAddress = `${npubEncode(String($ndkStore.activeUser?.pubkey))}@npub.cash`}

			<div class="space-y-2">
				<p>You don't have a Lightning address linked to your profile. Here are your options:</p>

				<div class="bg-secondary p-4 flex flex-col gap-2">
					<h4 class="font-semibold">
						1. Use an <a href="https://npub.cash" target="_blank" rel="noreferrer" class="text-primary hover:underline">Npub.cash</a> address
					</h4>
					<Button class="mt-2" on:click={() => setupPaymentDetail(npubCashAddress, PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK)}>
						Use npub.cash Address
					</Button>
					<p>
						Check <a href="https://npub.cash" target="_blank" rel="noreferrer" class="text-primary hover:underline">Npub.cash</a> to know more
						about the project
					</p>
				</div>

				<div class="bg-secondary p-4 flex flex-col gap-2">
					<h4 class="font-semibold">2. Paste from clipboard</h4>
					<Button variant="outline" class="mt-2" on:click={handlePaste}
						><span class="i-mingcute-clipboard-fill text-black w-6 h-6"></span> Paste</Button
					>
					<p>Paste your payment details from the clipboard and we'll auto-detect the method.</p>
				</div>

				<div class="bg-secondary p-4 flex flex-col gap-2">
					<h4 class="font-semibold">3. Set up manually</h4>
					<Button variant="outline" class="mt-2" on:click={closeGuidance}>Set Up Manually</Button>
					<p>
						If you don't have a lightning address yet, we recommend setting up one at <a
							href="https://coinos.io"
							target="_blank"
							rel="noreferrer"
							class="text-primary hover:underline">Coinos.io</a
						>, then come back to enter it manually.
					</p>
				</div>
			</div>
		{/if}
	{/if}
</div>
