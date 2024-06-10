<script lang="ts">
	import { page } from '$app/stores'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Slider } from '$lib/components/ui/slider/index.js'
	import { nav_back } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	const { appSettings } = data
	let v4v = [50]
	const details = data.menuItems.find((item) => item.value === 'v4v-settings')
</script>

<div class="pb-4 space-y-2">
	<div>
		<div class=" flex items-center gap-1">
			<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
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

	<Label class="font-bold">Value for value contribution (%{v4v[0]})</Label>
	<Slider bind:value={v4v} max={100} step={1} />
	<div class="text-center my-4">
		<span class="p-4 text-4xl rounded-full bg-[var(--neo-gray)]"> 🤙 </span>
	</div>

	<Button class="w-full font-bold">Save</Button>
</div>
