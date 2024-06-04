<!-- +layout.svelte -->
<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation'
	import { page } from '$app/stores'
	import * as Accordion from '$lib/components/ui/accordion'
	import ndkStore from '$lib/stores/ndk'

	import type { PageData } from './$types'

	export let data: PageData
	const { menuItems } = data
	let value = menuItems[0].value

	afterNavigate(() => {
		value = menuItems.find((item) => $page.url.pathname === item.root)?.value || menuItems[0].value
	})
</script>

{#if $ndkStore.activeUser && $ndkStore.signer}
	<div class="p-1 grid grid-cols-[200px_1fr] md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
		<div>
			<h2><a href="/settings">Settings</a></h2>
			<Accordion.Root bind:value>
				{#each menuItems as item}
					<Accordion.Item value={item.value}>
						<Accordion.Trigger
							on:click={() => {
								item.title == 'Value 4 value' ? goto(item.root) : ''
							}}
						>
							{item.title}
						</Accordion.Trigger>
						<Accordion.Content>
							<ul class="pl-4">
								{#each item.links as link}
									<li><a href={link.href}>{link.title}</a></li>
								{/each}
							</ul>
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</div>
		<div class="p-4">
			<slot />
		</div>
	</div>
{:else}
	you must login
{/if}
