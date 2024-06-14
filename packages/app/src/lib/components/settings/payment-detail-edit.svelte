<script lang="ts">
	import type { RichPaymentDetail } from '$lib/server/paymentDetails.service'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Input } from '$lib/components/ui/input'
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select'
	import { deletePaymentMethodMutation, updatePaymentMethodMutation } from '$lib/fetch/payments.mutations'
	import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
	import ndkStore from '$lib/stores/ndk'

	import type { PaymentDetailsMethod } from '@plebeian/database'

	import { Button } from '../ui/button'
	import { Checkbox } from '../ui/checkbox'
	import { Label } from '../ui/label'

	export let paymentDetail: RichPaymentDetail

	export let paymentDetailsMethod: PaymentDetailsMethod

	let paymentDetailEdit = paymentDetail

	let inEdit = false

	$: isDisabled = paymentDetailEdit.stallId === null

	$: stallsQuery = $ndkStore.activeUser?.pubkey
		? createStallsByFilterQuery({
				userId: $ndkStore.activeUser.pubkey,
			})
		: null

	const toggleEdit = () => {
		inEdit = !inEdit
	}

	const handleDeletePaymentMethod = async (paymentDetailId: string) => {
		$deletePaymentMethodMutation.mutate({
			paymentDetailId,
			userId: $ndkStore.activeUser?.pubkey as string,
		})
	}
	const handleUpdatePaymentMethod = async () => {
		await $updatePaymentMethodMutation.mutateAsync({
			paymentDetails: paymentDetailEdit.paymentDetails,
			paymentMethod: paymentDetailEdit.paymentMethod,
			stallId: paymentDetailEdit.stallId ?? null,
			paymentDetailId: paymentDetailEdit.id,
			isDefault: paymentDetailEdit.isDefault,
		})
		inEdit = false
	}
</script>

<div class="border border-gray flex flex-col p-2 justify-between">
	<Collapsible.Root open={inEdit}>
		<Collapsible.Trigger on:click={() => toggleEdit()} class=" flex flex-row w-full justify-between gap-2 mb-3">
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
			<div class="flex flex-row gap-2 items-center mr-2">
				{#if paymentDetail.stallName}
					{#if paymentDetail.isDefault}
						<span
							class="i-mdi-star
							text-primary w-6 h-6"
						/>
					{/if}

					<span class=" font-bold">{paymentDetail.stallName}</span>
					<span class="i-tdesign-store w-6 h-6" />
				{:else}
					<span class=" font-bold">General</span>
					<span class=" i-mingcute-earth-2-line w-6 h-6" />
				{/if}
			</div>
		</Collapsible.Trigger>
		<Collapsible.Content class="flex flex-col gap-4 py-4">
			<div class="flex flex-row gap-4 items-center">
				<Select
					selected={{
						value: paymentDetailEdit.paymentMethod,
						label: paymentDetailEdit.paymentMethod,
					}}
					onSelectedChange={(sEvent) => {
						if (sEvent) {
							paymentDetailEdit.paymentMethod = sEvent.value
						}
					}}
					name="paymentMethod"
				>
					<SelectTrigger class="border-black border-2">
						<SelectValue placeholder="payment method" />
					</SelectTrigger>
					<SelectContent class="border-black border-2 max-h-[350px] overflow-y-auto">
						{#each paymentDetailsMethod as method}
							<div class="flex items-center gap-2">
								<SelectItem value={method}>{method}</SelectItem>
							</div>
						{/each}
					</SelectContent>
				</Select>
				<Select
					selected={{
						value: paymentDetailEdit.stallId,
						label: paymentDetailEdit.stallName,
					}}
					onSelectedChange={(sEvent) => {
						if (sEvent?.value === null) {
							paymentDetailEdit.stallId = null
							paymentDetailEdit.stallName = 'General'
							paymentDetailEdit.isDefault = false
						}

						if (sEvent?.value && sEvent?.label) {
							paymentDetailEdit.stallId = sEvent.value
							paymentDetailEdit.stallName = sEvent.label
							paymentDetailEdit.isDefault = false
						}
					}}
					name="assignStallForPaymentMehtod"
				>
					<SelectTrigger class="border-black border-2">
						<SelectValue placeholder="assign a stall" />
					</SelectTrigger>
					<SelectContent class="border-black border-2 max-h-[350px] overflow-y-auto">
						<SelectItem value={null}>General</SelectItem>
						{#if $stallsQuery && $stallsQuery.data}
							{#each $stallsQuery.data as stall}
								<div class="flex items-center gap-2">
									<SelectItem value={stall.id}>{stall.name}</SelectItem>
								</div>
							{/each}
						{/if}
					</SelectContent>
				</Select>
				<div class="flex flex-col items-center gap-1">
					<Label class="truncate font-bold">Default</Label>
					<Checkbox
						required
						class="border-black border-2"
						name="allowRegister"
						bind:disabled={isDisabled}
						bind:checked={paymentDetailEdit.isDefault}
					/>
				</div>
			</div>
			<Label class="truncate font-bold">Payment details</Label>
			<Input required bind:value={paymentDetailEdit.paymentDetails} class="border-black border-2" placeholder="payment details" />
		</Collapsible.Content>
	</Collapsible.Root>

	<div class="flex flex-row-reverse gap-2">
		<Button
			id="signInSubmit"
			type="submit"
			class="border-none"
			variant="ghost"
			size="icon"
			on:click={() => handleDeletePaymentMethod(paymentDetail.id)}
		>
			<span class="i-mdi-trash w-6 h-6 cursor-pointer" />
		</Button>

		{#if inEdit}
			<Button id="signInSubmit" type="submit" class="border-none" variant="ghost" size="sm" on:click={() => handleUpdatePaymentMethod()}>
				<span class="i-mdi-content-save-outline w-6 h-6 mr-1" /><span>Save</span>
			</Button>
		{/if}
	</div>
</div>
