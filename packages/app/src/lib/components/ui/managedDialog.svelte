<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import { dialogs } from '$lib/stores/dialog'

	export let open = false

	$: if (!open) {
		dialogs.reset()
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<slot />
	</Dialog.Content>
</Dialog.Root>
