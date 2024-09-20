<script lang="ts">
	import type { V4VDTO } from '$lib/fetch/v4v.queries'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { Slider } from '$lib/components/ui/slider/index.js'
	import V4vRecipientEdit from '$lib/components/v4v/v4v-recipient-edit.svelte'
	import { setV4VForUserMutation } from '$lib/fetch/v4v.mutations'
	import { v4VForUserQuery } from '$lib/fetch/v4v.queries'
	import { decimalToPercentage, nav_back, stringToHexColor } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	const { appSettings, activeUser } = data
	let v4vTotal = [0]
	let initialTotalSet = false

	let hoveredRecipient: string | null = null
	let v4vHovered = false
	let newRecipientFormVisible = false

	const details = data.menuItems.find((item) => item.value === 'v4v-settings')
	$: emojiSize = 16 + v4vTotal[0] * 100
	$: shouldWiggle = v4vTotal[0] > 0.04
	$: shouldShake = v4vTotal[0] > 0.09
	$: shouldGlow = v4vTotal[0] > 0.14
	$: emojiClass = shouldGlow ? 'wiggle-shake-glow' : shouldShake ? 'wiggle-shake' : shouldWiggle ? 'wiggle' : ''

	$: v4vByUser = v4VForUserQuery(activeUser?.id ?? '')
	let v4vRecipients: V4VDTO[] = []

	$: {
		if ($v4vByUser.data && !initialTotalSet) {
			const total = $v4vByUser.data.reduce((sum, item) => sum + item.amount, 0)
			v4vTotal = [total]
			initialTotalSet = true
			v4vRecipients = $v4vByUser.data.map((item) => ({
				target: item.target,
				amount: total > 0 ? item.amount / total : 0,
			}))
		}
	}

	function handleMouseEnter(npub: string) {
		hoveredRecipient = npub
	}

	function handleMouseLeave() {
		hoveredRecipient = null
	}

	function handleV4VMouseEnter() {
		v4vHovered = true
	}

	function handleV4VMouseLeave() {
		v4vHovered = false
	}

	function handleSetAllEqual() {
		const equalAmount = 1 / v4vRecipients.length
		v4vRecipients = v4vRecipients.map((item) => ({ ...item, amount: equalAmount }))
		v4vRecipients = [...v4vRecipients]
	}

	function handleIndividualPercentageChange(event: CustomEvent<{ npub: string; percentage: number }>) {
		const { npub, percentage } = event.detail
		const oldPercentage = v4vRecipients.find((item) => item.target === npub)?.amount || 0
		const difference = percentage - oldPercentage

		v4vRecipients = v4vRecipients.map((item) => {
			if (item.target === npub) {
				return { ...item, amount: percentage }
			} else {
				const scale = (1 - percentage) / (1 - oldPercentage)
				return { ...item, amount: item.amount * scale }
			}
		})

		// Normalize to ensure total is exactly 1
		const total = v4vRecipients.reduce((sum, item) => sum + item.amount, 0)
		v4vRecipients = v4vRecipients.map((item) => ({ ...item, amount: item.amount / total }))
	}

	function handleRecipientAdded(event: CustomEvent<{ npub: string; percentage: number }>) {
		const { npub, percentage } = event.detail
		v4vRecipients = [...v4vRecipients, { target: npub, amount: percentage }]
		newRecipientFormVisible = false
	}

	function handleRecipientRemoved(event: CustomEvent<{ npub: string }>) {
		const { npub } = event.detail
		const removedRecipient = v4vRecipients.find((item) => item.target === npub)
		if (!removedRecipient) return

		const remainingRecipients = v4vRecipients.filter((item) => item.target !== npub)
		const totalRemainingPercentage = 1 - removedRecipient.amount

		v4vRecipients = remainingRecipients.map((item) => ({
			...item,
			amount: totalRemainingPercentage > 0 ? item.amount / totalRemainingPercentage : 1 / remainingRecipients.length,
		}))
	}

	$: displayValue = decimalToPercentage(v4vTotal[0])

	const handleSetV4VAmounts = async () => {
		const totalPercentage = v4vTotal[0]
		const adjustedRecipients = v4vRecipients.map((recipient) => ({
			target: recipient.target,
			amount: recipient.amount * totalPercentage,
		}))

		await $setV4VForUserMutation.mutate(adjustedRecipients)
	}
</script>

s
<div class="pb-4 space-y-6">
	<div>
		<div class="flex items-center gap-1">
			<Button size="icon" variant="outline" class="border-none" on:click={() => nav_back()}>
				<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
			</Button>
			<section>
				<h3 class="text-lg font-bold">{details?.title}</h3>
				<p class="text-gray-600">{details?.description}</p>
			</section>
		</div>
	</div>

	<Alert.Root class="bg-[var(--neo-blue)]">
		<Alert.Description
			>{appSettings.instanceName} is powered by your generosity. Your contribution is the only thing that enables us to continue creating free
			and open source solutions 🙏🙇‍♂️
		</Alert.Description>
	</Alert.Root>

	<Label class="font-bold">Value for value contribution ({displayValue}%)</Label>
	<Slider bind:value={v4vTotal} max={1} step={0.01} />

	<div class="text-center my-4">
		<span
			class="p-4 rounded-full bg-[var(--neo-gray)] inline-flex items-center justify-center {emojiClass}"
			style="font-size: {emojiSize}px; width: {emojiSize * 1.5}px; height: {emojiSize * 1.5}px;"
		>
			🤙
		</span>
	</div>

	<Separator />

	<div class="space-y-8">
		<div>
			<Label class="font-bold">V4V share</Label>
			<div class="flex w-full h-16 gap-1">
				<div class="border-4 h-full bg-white border-green-400 flex items-center justify-center" style="width: {(1 - v4vTotal[0]) * 100}%;">
					<span>you</span>
				</div>
				<div
					on:mouseenter={handleV4VMouseEnter}
					on:mouseleave={handleV4VMouseLeave}
					role="button"
					tabindex="0"
					class="border-4 h-full bg-white right-0 border-blue-500 flex items-center justify-center"
					style="width: {v4vTotal[0] * 100}%;"
				>
					<span>v4v</span>
				</div>
			</div>
		</div>
		<div>
			<Label class="font-bold ">Distribution of v4v share among recipients</Label>
			<div class={'flex w-full h-16 gap-1'}>
				{#each v4vRecipients as v4v}
					<div
						class={v4vHovered ? 'highlight-edit w-full border-4 bg-white' : 'w-full border-4 bg-white'}
						style="width: {v4v.amount * 100}%; border-color: {stringToHexColor(v4v.target)}"
						title="{v4v.target}: {(v4v.amount * 100).toFixed(2)}%"
						on:mouseenter={() => handleMouseEnter(v4v.target)}
						on:mouseleave={handleMouseLeave}
						role="button"
						tabindex="0"
					></div>
				{/each}
			</div>
		</div>
	</div>

	{#if $v4vByUser.data}
		{#each v4vRecipients as v4v}
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
			percentage={0}
			on:percentageChange={handleIndividualPercentageChange}
			on:recipientAdded={handleRecipientAdded}
			on:recipientRemoved={handleRecipientRemoved}
		/>
	{/if}

	<div class="flex gap-2">
		<Button class="w-full font-bold" variant={'secondary'} on:click={() => (newRecipientFormVisible = true)}>Add v4v recipient</Button>
		<Button class="w-full font-bold" variant={'secondary'} on:click={handleSetAllEqual}
			><span class="i-mdi-equal-box w-6 h-6 mr-2" />Set all equal</Button
		>
	</div>

	<Separator />

	<Button class="w-full font-bold" on:click={handleSetV4VAmounts}>Save</Button>
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
