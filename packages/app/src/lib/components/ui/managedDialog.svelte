<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'

	export let open = false
	export let onClose: () => void
	export let onAction: () => void

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			onClose()
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content>
		<slot {onAction} />
	</Dialog.Content>
</Dialog.Root>
