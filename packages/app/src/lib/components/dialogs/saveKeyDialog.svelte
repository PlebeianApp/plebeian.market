<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import * as Dialog from '$lib/components/ui/dialog'
	import { dialogs } from '$lib/stores/dialog'

	export let nsec: string

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text)
	}

	function handlePrivKeyConfirmation() {
		dialogs.hide()
	}
</script>

<Dialog.Header>
	<Dialog.Title>Save your account key</Dialog.Title>
	<Dialog.Description class="text-black">
		Here is your newly generated account key. It allows you to purchase anonymously, and is stored in your browser on this device only.
		<span class="font-bold">Be sure to save it, or you'll lose access to your account</span>
	</Dialog.Description>
</Dialog.Header>

<Button variant="secondary" class="relative overflow-auto flex flex-row gap-2 bg-transparent" on:click={() => copyToClipboard(nsec)}>
	<code class="truncate w-3/4">{nsec}</code>
	<span class="i-tdesign-copy" style="width: 1rem; height: 1rem; color: black;" />
</Button>

<Button variant="focus" on:click={handlePrivKeyConfirmation} class="w-full font-bold">I understand, and I saved my key</Button>
