<script lang="ts">
	import type { V4VDTO } from '$lib/fetch/v4v.queries'
	import { goto } from '$app/navigation'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { Slider } from '$lib/components/ui/slider/index.js'
	import * as Tooltip from '$lib/components/ui/tooltip/index.js'
	import V4vRecipientEdit from '$lib/components/v4v/v4v-recipient-edit.svelte'
	import { privatePaymentsQuery } from '$lib/fetch/payments.queries'
	import { setV4VForUserMutation } from '$lib/fetch/v4v.mutations'
	import { v4VForUserQuery } from '$lib/fetch/v4v.queries'
	import ndkStore from '$lib/stores/ndk'
	import { decimalToPercentage, getHexColorFingerprintFromHexPubkey } from '$lib/utils'
	import { toast } from 'svelte-sonner'

	import type { PageData } from './$types'

	export let data: PageData
	const { appSettings } = data
	let v4vTotal = [0]
	let initialTotalSet = false
	let hoveredRecipient: string | null = null
	let newRecipientFormVisible = false

	const details = data.menuItems.find((item) => item.value === 'cecb-settings')
	$: emojiSize = 16 + v4vTotal[0] * 100
	$: shouldWiggle = v4vTotal[0] > 0.04
	$: shouldShake = v4vTotal[0] > 0.09
	$: shouldGlow = v4vTotal[0] > 0.14
	$: emojiClass = shouldGlow ? 'wiggle-shake-glow' : shouldShake ? 'wiggle-shake' : shouldWiggle ? 'wiggle' : ''
	$: emoji = v4vTotal[0] > 0.14 ? '🤙' : v4vTotal[0] > 0.09 ? '🤙' : v4vTotal[0] > 0.04 ? '🤙' : v4vTotal[0] < 0.01 ? '💩' : '🎁'
	$: v4vByUser = $privatePaymentsQuery?.data?.length ? v4VForUserQuery($ndkStore.activeUser?.pubkey ?? '') : undefined

	let v4vRecipients: V4VDTO[] = []

	$: {
		if ($v4vByUser && $v4vByUser.data && !initialTotalSet) {
			const total = $v4vByUser.data.reduce((sum, item) => sum + item.amount, 0)
			v4vTotal = [total]
			initialTotalSet = true
			v4vRecipients = $v4vByUser.data.map((item) => ({
				target: item.target,
				amount: total > 0 ? item.amount / total : 0,
			}))
		}
	}

	function handleSetAllEqual() {
		const equalAmount = 1 / v4vRecipients.length
		v4vRecipients = v4vRecipients.map((item) => ({ ...item, amount: equalAmount }))
		v4vRecipients = [...v4vRecipients]
	}
	function handleIndividualPercentageChange(event: CustomEvent<{ npub: string; percentage: number }>) {
		const { npub, percentage } = event.detail

		const totalOthers = v4vRecipients.reduce((sum, item) => (item.target !== npub ? sum + item.amount : sum), 0)

		v4vRecipients = v4vRecipients.map((item) => {
			if (item.target === npub) {
				return { ...item, amount: percentage }
			} else {
				const newAmount = totalOthers > 0 ? (item.amount * (1 - percentage)) / totalOthers : (1 - percentage) / (v4vRecipients.length - 1)
				return { ...item, amount: Math.max(newAmount, 0) }
			}
		})

		const total = v4vRecipients.reduce((sum, item) => sum + item.amount, 0)
		v4vRecipients = v4vRecipients.map((item) => ({
			...item,
			amount: Number((total > 0 ? item.amount / total : 1 / v4vRecipients.length).toFixed(6)),
		}))
	}

	function handleRecipientAdded(event: CustomEvent<{ npub: string; percentage: number }>) {
		const { npub, percentage } = event.detail
		if (v4vRecipients.some((r) => r.target === npub)) {
			toast.error('Recipient already exists')
			return
		}
		const newRecipient = { target: npub, amount: percentage }

		const totalExisting = v4vRecipients.reduce((sum, item) => sum + item.amount, 0)
		const adjustmentFactor = (1 - percentage) / totalExisting

		v4vRecipients = v4vRecipients.map((item) => ({
			...item,
			amount: Number((item.amount * adjustmentFactor).toFixed(6)),
		}))

		v4vRecipients = [...v4vRecipients, newRecipient]

		newRecipientFormVisible = false
	}
	function handleRecipientRemoved(event: CustomEvent<{ npub: string }>) {
		const { npub } = event.detail
		v4vRecipients = v4vRecipients.filter((item) => item.target !== npub)

		if (v4vRecipients.length === 0) {
			v4vTotal = [0]
		} else {
			const totalPercentage = v4vRecipients.reduce((sum, item) => sum + item.amount, 0)
			v4vRecipients = v4vRecipients.map((item) => ({
				...item,
				amount: Number((item.amount / totalPercentage).toFixed(6)),
			}))
		}
	}
	$: displayValue = decimalToPercentage(v4vTotal[0])

	const handleSetV4VAmounts = async () => {
		const totalPercentage = v4vTotal[0]
		if (!v4vRecipients.length && totalPercentage > 0) {
			toast.error('Please add at least one recipient')
			return
		}
		if (v4vRecipients.length && totalPercentage === 0) {
			toast.error('Total percentage must be greater than 0')
			return
		}
		if (totalPercentage === 0 || v4vRecipients.length === 0) {
			await $setV4VForUserMutation.mutateAsync([])
			toast.success('V4V settings cleared')
			return
		}

		const adjustedRecipients = v4vRecipients.map((recipient) => ({
			target: recipient.target,
			amount: Number((recipient.amount * totalPercentage).toFixed(6)),
		}))

		const sum = adjustedRecipients.reduce((acc, r) => acc + r.amount, 0)
		const roundedTotal = Number(totalPercentage.toFixed(6))

		if (Math.abs(sum - roundedTotal) > 0.000001) {
			const diff = roundedTotal - sum
			const largestRecipient = adjustedRecipients.reduce((max, r) => (r.amount > max.amount ? r : max))
			largestRecipient.amount = Number((largestRecipient.amount + diff).toFixed(6))
		}

		try {
			await $setV4VForUserMutation.mutateAsync(adjustedRecipients)
			toast.success('V4V values successfully updated')
		} catch (error) {
			console.error('Error updating V4V values:', error)
			toast.error('Failed to update V4V values')
		}
	}

	function getContrastColor(hexColor: string) {
		const r = parseInt(hexColor.slice(1, 3), 16)
		const g = parseInt(hexColor.slice(3, 5), 16)
		const b = parseInt(hexColor.slice(5, 7), 16)
		const yiq = (r * 299 + g * 587 + b * 114) / 1000
		return yiq >= 128 ? 'black' : 'white'
	}
</script>

<div class="pb-4 space-y-6 px-2 w-full">
	<div>
		<div class="flex items-center gap-1">
			<Button variant="ghost" size="icon" on:click={() => goto('/settings')}>
				<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
			</Button>
			<section>
				<h3 class="text-lg font-bold">{details?.title}</h3>
				<p class="text-gray-600">{details?.description}</p>
			</section>
		</div>
	</div>

	{#if !$privatePaymentsQuery?.data?.length}
		<Alert.Root variant="destructive">
			<Alert.Description>
				It seems you don't have any defined payment details. Please go to <a class="underline" href="/settings/account/payments">Payments</a
				> and establish at least one.
			</Alert.Description>
		</Alert.Root>
	{:else}
		<Alert.Root class="bg-[var(--neo-blue)]">
			<Alert.Description
				>{appSettings?.instanceName} is powered by your generosity. Your contribution is the only thing that enables us to continue creating
				free and open source solutions 🙏🙇‍♂️
			</Alert.Description>
		</Alert.Root>
	{/if}
	<Label class="font-bold">Value for value contribution ({displayValue}%)</Label>
	<Slider bind:value={v4vTotal} max={1} step={0.01} />

	<div class="text-center my-4">
		<span
			class="p-4 rounded-full bg-[var(--neo-gray)] inline-flex items-center justify-center {emojiClass}"
			style="font-size: {emojiSize}px; width: {emojiSize * 1.5}px; height: {emojiSize * 1.5}px;"
		>
			{emoji}
		</span>
	</div>

	<Separator />

	<div class="space-y-8">
		<div>
			<Label class="font-bold">V4V share</Label>
			<div class="relative w-full h-5 bg-gray-200 rounded-lg overflow-hidden">
				<Tooltip.Root>
					<Tooltip.Trigger
						class="absolute inset-y-0 left-0 bg-green-400 flex items-center justify-center"
						style="width: {(1 - v4vTotal[0]) * 100}%;"
					>
						<span class="text-current">You</span>
					</Tooltip.Trigger>
					<Tooltip.Content>Your share: {((1 - v4vTotal[0]) * 100).toFixed(2)}%</Tooltip.Content>
				</Tooltip.Root>
				{#if v4vTotal[0] > 0}
					<Tooltip.Root>
						<Tooltip.Trigger
							class="absolute inset-y-0 right-0 bg-blue-500 flex items-center justify-center"
							style="width: {v4vTotal[0] * 100}%;"
						>
							<span class="text-current">V4V</span>
						</Tooltip.Trigger>
						<Tooltip.Content>V4V share: {(v4vTotal[0] * 100).toFixed(2)}%</Tooltip.Content>
					</Tooltip.Root>
				{/if}
			</div>
		</div>

		<div>
			<Label class="font-bold">Distribution of v4v share among recipients</Label>
			<div class="relative w-full h-10 bg-gray-200 rounded-lg overflow-hidden">
				{#each v4vRecipients as v4v, index (v4v.target)}
					{#if v4v.target}
						{@const color = getHexColorFingerprintFromHexPubkey(v4v.target)}
						{@const textColor = getContrastColor(color)}
						{@const leftPosition = v4vRecipients.slice(0, index).reduce((sum, r) => sum + r.amount, 0) * 100}
						<Tooltip.Root>
							<Tooltip.Trigger
								class="absolute inset-y-0 flex items-center justify-center"
								style="left: {leftPosition}%; width: {v4v.amount * 100}%; background-color: {color};"
							>
								<span class="font-semibold text-xs" style="color: {textColor}">
									{(v4v.amount * 100).toFixed(1)}%
								</span>
							</Tooltip.Trigger>
							<Tooltip.Content>
								{v4v.target}: {(v4v.amount * 100).toFixed(2)}%
							</Tooltip.Content>
						</Tooltip.Root>
					{/if}
				{/each}
			</div>
		</div>
	</div>
	{#if $v4vByUser?.data}
		{#each v4vRecipients as v4v (v4v.target)}
			<div class={hoveredRecipient === v4v.target ? 'highlight-edit' : ''}>
				<V4vRecipientEdit
					npub={v4v.target}
					percentage={v4v.amount}
					on:percentageChange={handleIndividualPercentageChange}
					on:recipientAdded={handleRecipientAdded}
					on:recipientRemoved={handleRecipientRemoved}
				/>
			</div>
		{/each}
	{/if}

	{#if newRecipientFormVisible}
		<V4vRecipientEdit
			npub={''}
			percentage={v4vRecipients.length == 0 ? 1 : 0.1}
			isNewRecipient={true}
			on:percentageChange={handleIndividualPercentageChange}
			on:recipientAdded={handleRecipientAdded}
			on:recipientRemoved={handleRecipientRemoved}
		/>
	{/if}
	<div class="flex gap-2">
		<Button variant="primary" class="w-full font-bold" on:click={() => (newRecipientFormVisible = true)}>Add v4v recipient</Button>
		<Button variant="tertiary" class="w-full font-bold" on:click={handleSetAllEqual}
			><span class="i-mdi-equal-box w-6 h-6 mr-2" />Set all equal</Button
		>
	</div>

	<Separator />

	<Button class="w-full font-bold" disabled={$v4vByUser?.data?.length == v4vRecipients.length} on:click={handleSetV4VAmounts}>Save</Button>
</div>

<style>
	@keyframes wiggle {
		0% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-10deg);
		}
		75% {
			transform: rotate(10deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	@keyframes shake {
		0% {
			transform: translate(1px, 1px) rotate(0deg);
		}
		10% {
			transform: translate(-1px, -2px) rotate(-1deg);
		}
		20% {
			transform: translate(-3px, 0px) rotate(1deg);
		}
		30% {
			transform: translate(3px, 2px) rotate(0deg);
		}
		40% {
			transform: translate(1px, -1px) rotate(1deg);
		}
		50% {
			transform: translate(-1px, 2px) rotate(-1deg);
		}
		60% {
			transform: translate(-3px, 1px) rotate(0deg);
		}
		70% {
			transform: translate(3px, 1px) rotate(-1deg);
		}
		80% {
			transform: translate(-1px, -1px) rotate(1deg);
		}
		90% {
			transform: translate(1px, 2px) rotate(0deg);
		}
		100% {
			transform: translate(1px, -2px) rotate(-1deg);
		}
	}

	@keyframes glow {
		0% {
			box-shadow: 0 0 5px 2px rgba(255, 0, 0, 0.5);
		}
		50% {
			box-shadow: 0 0 20px 10px rgba(255, 0, 0, 0.5);
		}
		100% {
			box-shadow: 0 0 5px 2px rgba(255, 0, 0, 0.5);
		}
	}

	.wiggle {
		animation: wiggle 0.5s ease-in-out infinite;
	}

	.shake {
		animation: shake 0.5s ease-in-out infinite;
	}

	.wiggle-shake {
		animation:
			wiggle 0.5s ease-in-out infinite,
			shake 0.5s ease-in-out infinite;
	}

	.glow {
		animation: glow 1s ease-in-out infinite;
	}

	.wiggle-shake-glow {
		animation:
			wiggle 0.5s ease-in-out infinite,
			shake 0.5s ease-in-out infinite,
			glow 1s ease-in-out infinite;
	}

	.highlight-edit {
		outline: 2px solid var(--neo-blue);
		background-color: rgba(var(--neo-blue-rgb), 0.1);
		transition: all 0.2s ease-in-out;
	}
</style>
