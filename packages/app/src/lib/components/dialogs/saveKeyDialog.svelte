<script lang="ts">
	import { page } from '$app/stores'
	import { Button } from '$lib/components/ui/button'
	import { dialogs } from '$lib/stores/dialog'
	import { copyToClipboard } from '$lib/utils'

	import Pattern from '../Pattern.svelte'

	export let nsec: string

	function handlePrivKeyConfirmation() {
		dialogs.hide()
	}
</script>

<div class="flex flex-col overflow-y-auto">
	<div class="relative w-full bg-black text-center py-8 flex items-center justify-center">
		<Pattern />
		<div class="flex flex-row gap-2 items-center z-10 px-4">
			<h2 class="text-secondary">Save your account key</h2>
		</div>
	</div>

	<div class="flex flex-col gap-4 p-6">
		<p class="text-base">
			Here is your newly generated account key. It allows you to purchase anonymously, and is stored in your browser on this device only.
		</p>
		<span class="font-bold">Be sure to save it, or you'll lose access to your account</span>

		<Button
			variant="secondary"
			class="relative flex flex-row items-center justify-between gap-2 bg-transparent"
			on:click={() => copyToClipboard(nsec)}
		>
			<code class="truncate flex-1 text-currentColor text-sm">{nsec}</code>
			<span class="i-tdesign-copy shrink-0" style="width: 1rem; height: 1rem; color: black;" />
		</Button>

		<Button variant="focus" on:click={handlePrivKeyConfirmation} class="w-full font-bold">I have saved my key</Button>
	</div>
</div>
