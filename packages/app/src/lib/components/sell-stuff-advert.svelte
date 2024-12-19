<script lang="ts">
	import AuthDialog from '$lib/components/dialogs/authDialog.svelte'
	import { dialogs } from '$lib/stores/dialog'
	import { openDrawerForNewProduct } from '$lib/stores/drawer-ui'
	import ndkStore from '$lib/stores/ndk'

	import Button from './ui/button/button.svelte'

	function handleListItems() {
		if (!$ndkStore.activeUser) dialogs.show(AuthDialog, {})
		else openDrawerForNewProduct()
	}
</script>

<div class="w-full bg-primary py-12 text-center text-white">
	<span class="mb-8 text-3xl text-black">Join in on the fun!</span>
	<h1 class="text-black">Sell stuff for sats</h1>
	<Button variant="focus" class="relative z-10" on:click={handleListItems}
		><span>List your items in <span class="font-bold">2 minutes</span></span></Button
	>
</div>
