<script lang="ts">
	import RelayWidget from '$lib/components/assets/relayWidget.svelte'
	import * as Alert from '$lib/components/ui/alert/index.js'
</script>

<div class="pb-4 space-y-2">
	<Alert.Root class="bg-[var(--neo-blue)]">
		<Alert.Description
			>Your products are published to these relays (servers). You can modify this settings, but you cannot persist them for now. Working on
			it.</Alert.Description
		>
	</Alert.Root>

	<h4 class="text-lg font-bold">Relays</h4>
	<ul class="flex flex-col gap-2">
		<RelayWidget mode={'settings'} />
	</ul>
</div>
