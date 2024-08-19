<script lang="ts">
	import QrCode from '@castlenine/svelte-qrcode'
	import { currentStep } from '$lib/stores/checkout'

	import Button from '../ui/button/button.svelte'
</script>

<div class="w-1/2 mx-auto flex flex-col gap-4">
	<span class="mx-auto">Waiting for payment: 14.99 seconds left</span>
	<div class="mx-auto flex gap-2">
		<Button variant="ghost" class="truncate">lnbc500n1pn2vehkpp5m22vruwkcvvru...</Button>
		<Button><span class="i-tdesign-copy" /></Button>
	</div>
	<div class="flex justify-center">
		<QrCode data="https://github.com/" logoPath="/logo.svg" />
	</div>

	<div class="flex gap-2 mx-auto">
		<Button class="flex items-center gap-2">Open in app <span class="i-mdi-external-link" /></Button>
		<Button variant="ghost" class="flex items-center gap-2" on:click={() => currentStep.set($currentStep + 1)}
			>Skip <span class="i-mdi-arrow-right" /></Button
		>
	</div>
</div>
