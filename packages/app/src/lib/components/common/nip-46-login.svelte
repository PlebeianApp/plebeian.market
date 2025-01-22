<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { createEventDispatcher } from 'svelte'

	import ExposeNosconnect from './expose-nosconnect.svelte'
	import ScanBunker from './scan-bunker.svelte'

	const activeTab =
		'h-10 px-4 py-2 bg-light-gray text-off-black data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground data-[state=disabled]:bg-light-gray data-[state=disabled]:text-off-black data-[state=disabled]:border-light-gray data-[state=disabled]:opacity-100 disabled:opacity-100'

	const dispatch = createEventDispatcher()

	function handleEvent(event: CustomEvent) {
		dispatch('event', event.detail)
	}
</script>

<div class="flex flex-col gap-4 items-center">
	<Tabs.Root class="w-full">
		<Tabs.List class="w-full flex flex-row bg-transparent justify-center relative">
			<Tabs.Trigger value="expose-nosconnect" class={activeTab}>Scan with remote signer</Tabs.Trigger>
			<Tabs.Trigger value="scan-bunker" class={activeTab}>Provide bunker</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="expose-nosconnect">
			<ExposeNosconnect on:login={(e) => handleEvent(e)} />
		</Tabs.Content>
		<Tabs.Content value="scan-bunker">
			<ScanBunker on:login={(e) => handleEvent(e)} />
		</Tabs.Content>
	</Tabs.Root>
</div>
