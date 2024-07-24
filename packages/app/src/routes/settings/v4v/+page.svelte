<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Slider } from '$lib/components/ui/slider/index.js'
	import { setV4VForUserMutation } from '$lib/fetch/v4v.mutations'
	import { platformV4VForUserQuery } from '$lib/fetch/v4v.queries'
	import { decimalToPercentage, nav_back } from '$lib/utils'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { PageData } from './$types'

	export let data: PageData
	const { appSettings } = data
	let v4v = [0.1]
	const details = data.menuItems.find((item) => item.value === 'v4v-settings')
	$: emojiSize = 16 + v4v[0] * 100
	$: shouldWiggle = v4v[0] > 0.04
	$: shouldShake = v4v[0] > 0.09
	$: shouldGlow = v4v[0] > 0.14
	$: emojiClass = shouldGlow ? 'wiggle-shake-glow' : shouldShake ? 'wiggle-shake' : shouldWiggle ? 'wiggle' : ''

	onMount(() => {
		const unsubscribe = platformV4VForUserQuery.subscribe((result) => {
			if (result.data !== undefined) {
				v4v = [result.data]
			} else if (result.error) {
				console.error('Error fetching V4V data:', result.error)
			}
		})

		return () => {
			unsubscribe()
		}
	})

	function handleSliderChange(event: CustomEvent<number[]>) {
		if (event.detail && event.detail.length > 0) {
			v4v[0] = event.detail[0]
		}
	}

	$: displayValue = decimalToPercentage(v4v[0])

	const handleSetV4VAmount = async () => {
		const ammount = v4v[0].toPrecision(2)
		const res = await $setV4VForUserMutation.mutateAsync(ammount)
		toast.success(`Value for value contribution set to ${decimalToPercentage(res)}%`)
	}
</script>

<div class="pb-4 space-y-6">
	<div>
		<div class=" flex items-center gap-1">
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
	<Slider bind:value={v4v} max={1} step={0.01} on:onValueChange={handleSliderChange} />
	<div class="text-center my-4">
		<span
			class="p-4 rounded-full bg-[var(--neo-gray)] inline-flex items-center justify-center {emojiClass}"
			style="font-size: {emojiSize}px; width: {emojiSize * 1.5}px; height: {emojiSize * 1.5}px;"
		>
			🤙
		</span>
	</div>

	<Button class="w-full font-bold" disabled={$platformV4VForUserQuery.data === v4v[0]} on:click={handleSetV4VAmount}>Save</Button>
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
</style>
