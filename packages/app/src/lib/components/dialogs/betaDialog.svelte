<script>
	import { dialogs } from '$lib/stores/dialog'

	import { Button } from '../ui/button'
	import Separator from '../ui/separator/separator.svelte'

	function handleAccept() {
		dialogs.hide()
	}
</script>

<div class="p-6 flex flex-col gap-2">
	<p class=" font-bold">This is currently in beta, please dont rely on it for serious bussines.</p>
	<Separator />
	<p>
		If you find some bugs or have suggestions, please consider open an issue on <a
			class="underline"
			href="https://github.com/PlebeianTech/plebeian.market/issues/new"
			target="_blank"
			rel="noreferrer">our repo</a
		> describing your problem.
	</p>

	<Button variant="primary" on:click={handleAccept} class="w-full font-bold">I understand</Button>
</div>
