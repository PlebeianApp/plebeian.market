<script>
	import { dialogs } from '$lib/stores/dialog'

	import AuthDialog from '../dialogs/authDialog.svelte'
	import { Button } from '../ui/button'

	function showAuthDialog() {
		dialogs.show(AuthDialog, {})
	}
</script>

<div class=" flex flex-col items-center text-center justify-center w-fit gap-4">
	<p class=" font-bold">You must login</p>
	<svg xmlns="http://www.w3.org/2000/svg" width="10em" height="10em" viewBox="0 0 24 24"
		><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"
			><path stroke-dasharray="32" stroke-dashoffset="32" d="M13 4L20 4C20.5523 4 21 4.44772 21 5V19C21 19.5523 20.5523 20 20 20H13"
				><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.8s" values="32;0" /></path
			><path stroke-dasharray="12" stroke-dashoffset="12" d="M3 12h11.5" opacity="0"
				><set attributeName="opacity" begin="1s" to="1" /><animate
					fill="freeze"
					attributeName="stroke-dashoffset"
					begin="1s"
					dur="0.4s"
					values="12;0"
				/></path
			><path stroke-dasharray="6" stroke-dashoffset="6" d="M14.5 12l-3.5 -3.5M14.5 12l-3.5 3.5" opacity="0"
				><set attributeName="opacity" begin="1.4s" to="1" /><animate
					fill="freeze"
					attributeName="stroke-dashoffset"
					begin="1.4s"
					dur="0.4s"
					values="6;0"
				/></path
			></g
		></svg
	>
	<div>
		<Button on:click={showAuthDialog} class="flex items-center cursor-pointer gap-2 w-full">
			<span class="i-tdesign-user-1" />Log in
		</Button>
	</div>
</div>
