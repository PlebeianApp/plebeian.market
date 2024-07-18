<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { page } from '$app/stores'
	import MustLogin from '$lib/components/assets/mustLogin.svelte'
	import * as Accordion from '$lib/components/ui/accordion'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ menuItems, activeUser, userExist } = data)
	let value: string

	afterNavigate(() => {
		value = menuItems.find((item) => `/${$page.url.pathname.split('/').slice(1, 3).join('/')}` === item.root)?.value || ''
	})
</script>

{#if activeUser?.id}
	<div class="max-w-3xl mx-auto p-4">
		<div class="grid grid-cols-[200px_1fr] gap-2">
			<div class="w-full">
				<h2><a href="/settings">Settings</a></h2>
				<Accordion.Root bind:value>
					{#each menuItems as item}
						{#if activeUser.role === 'admin' || item.value !== 'app-settings'}
							<Accordion.Item value={item.value}>
								<Accordion.Trigger>
									<span id={item.value}>{item.title}</span>
								</Accordion.Trigger>
								<Accordion.Content>
									<ul class="pl-4 space-y-1">
										{#each item.links as link}
											{#if link.public || userExist}
												<li><a class={$page.url.pathname == link.href ? ' font-bold' : ''} href={link.href}>{link.title}</a></li>
											{/if}
										{/each}
									</ul>
								</Accordion.Content>
							</Accordion.Item>
						{/if}
					{/each}
				</Accordion.Root>
			</div>
			<div class="w-full">
				<slot />
			</div>
		</div>
	</div>
{:else}
	<div class="flex justify-center p-24">
		<MustLogin />
	</div>
{/if}
