<script lang="ts">
	import { dialogs } from '$lib/stores/dialog'

	import ManagedDialog from './managedDialog.svelte'

	$: ({ open, currentDialog } = $dialogs)

	function handleClose() {
		if (currentDialog) {
			dialogs.hide(currentDialog.id)
		}
	}

	function handleAction() {
		if (currentDialog) {
			dialogs.handleAction()
		}
	}

	$: dialogProps = {
		...currentDialog?.props,
		...(currentDialog?.onAction ? { handleAction } : {}),
	}
</script>

<ManagedDialog {open} onClose={handleClose} onAction={handleAction} size={currentDialog?.size || 'lg'}>
	{#if currentDialog?.component}
		<svelte:component this={currentDialog.component} {...dialogProps} />
	{/if}
</ManagedDialog>
