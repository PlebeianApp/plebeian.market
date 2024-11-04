<script lang="ts">
	import { dialogs } from '$lib/stores/dialog'

	import ManagedDialog from './managedDialog.svelte'

	$: ({ open, component, props } = $dialogs)
</script>

<ManagedDialog {open}>
	{#if component}
		<svelte:component this={component} {...props} />
	{/if}
</ManagedDialog>
