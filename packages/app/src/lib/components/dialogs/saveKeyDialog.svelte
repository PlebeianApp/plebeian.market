<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { dialogs } from '$lib/stores/dialog'
	import { copyToClipboard } from '$lib/utils'

	export let nsec: string

	function handlePrivKeyConfirmation() {
		dialogs.hide()
	}
</script>

<div class="flex flex-col gap-4 p-4 max-h-[90vh] overflow-y-auto">
	<div class="flex flex-col gap-2">
		<h2 class="font-semibold text-xxl">Save your account key</h2>
		<p class="text-base">
			Here is your newly generated account key. It allows you to purchase anonymously, and is stored in your browser on this device only.
			<span class="font-bold">Be sure to save it, or you'll lose access to your account</span>
		</p>
	</div>

	<div class="flex flex-col gap-4">
		<Button
			variant="secondary"
			class="relative flex flex-row items-center justify-between gap-2 bg-transparent"
			on:click={() => copyToClipboard(nsec)}
		>
			<code class="truncate flex-1 text-currentColor text-sm">{nsec}</code>
			<span class="i-tdesign-copy shrink-0" style="width: 1rem; height: 1rem; color: black;" />
		</Button>

		<Button variant="focus" on:click={handlePrivKeyConfirmation} class="w-full font-bold">I understand, and I saved my key</Button>
	</div>
</div>
