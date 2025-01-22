<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import * as Dialog from '$lib/components/ui/dialog'
	import { dialogs } from '$lib/stores/dialog'

	export let handleAction: () => void
</script>

<Dialog.Header>
	<Dialog.Title>Register in this instance</Dialog.Title>
</Dialog.Header>

<div class="py-4">
	This instance allow registration, which mean that it will store your account, shops, and products in its own database.
</div>

<Dialog.Footer>
	<Button variant="outline" on:click={() => dialogs.hide()}>Cancel</Button>
	<Button variant="primary" on:click={handleAction}>Confirm</Button>
</Dialog.Footer>
