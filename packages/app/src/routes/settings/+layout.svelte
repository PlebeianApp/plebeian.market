<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { page } from '$app/stores'
	import MustLogin from '$lib/components/assets/mustLogin.svelte'
	import * as Accordion from '$lib/components/ui/accordion'
	import * as Menubar from '$lib/components/ui/menubar'
	import { activeUserQuery, createUserExistsQuery } from '$lib/fetch/users.queries'
	import { breakpoint } from '$lib/stores/breakpoint'
	import ndkStore from '$lib/stores/ndk'
	import { shouldShowItem } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ menuItems } = data)
	let value: string
	afterNavigate(() => {
		value = menuItems.find((item) => `/${$page.url.pathname.split('/').slice(1, 3).join('/')}` === item.root)?.value || ''
	})
	$: userExist = $ndkStore.activeUser?.pubkey ? createUserExistsQuery($ndkStore.activeUser?.pubkey) : undefined
	$: if (!$activeUserQuery.data?.role) $activeUserQuery.refetch()
</script>

{#if $ndkStore.activeUser?.pubkey}
	{#if $breakpoint !== 'lg'}
		<div class="max-w-2xl mx-auto p-2">
			<div class="w-full space-y-4">
				<h4><a href="/settings">Settings</a></h4>
				<Menubar.Root>
					{#each menuItems as item}
						{#if shouldShowItem(item, $userExist?.data?.exists, $activeUserQuery.data?.role)}
							<Menubar.Menu>
								<Menubar.Trigger class="text-xs p-4"><span id={item.value}>{item.title}</span></Menubar.Trigger>
								<Menubar.Content>
									{#if $activeUserQuery.data?.role === 'admin' || item.value !== 'app-settings'}
										{#each item.links as link}
											{#if link.public || ($userExist?.data?.exists && !$userExist?.data?.banned)}
												<Menubar.Item>
													<li>
														<a class={$page.url.pathname == link.href ? ' font-bold' : ''} href={link.href}>{link.title}</a>
													</li>
												</Menubar.Item>
											{/if}
										{/each}
									{/if}
								</Menubar.Content>
							</Menubar.Menu>
						{/if}
					{/each}
				</Menubar.Root>

				<div class="w-full">
					<slot />
				</div>
			</div>
		</div>
	{:else}
		<div class="max-w-4xl mx-auto p-4">
			<div class="grid grid-cols-[200px_1fr] gap-2">
				<div class="w-full">
					<h2><a href="/settings">Settings</a></h2>
					<Accordion.Root bind:value>
						{#each menuItems as item}
							{#if shouldShowItem(item, $userExist?.data?.exists, $activeUserQuery.data?.role)}
								{#if $activeUserQuery.data?.role === 'admin' || item.value !== 'app-settings'}
									<Accordion.Item value={item.value}>
										<Accordion.Trigger>
											<span id={item.value}>{item.title}</span>
										</Accordion.Trigger>
										<Accordion.Content>
											<ul class="pl-4 space-y-1">
												{#each item.links as link}
													{#if link.public || $userExist?.data}
														<li><a class={$page.url.pathname == link.href ? ' font-bold' : ''} href={link.href}>{link.title}</a></li>
													{/if}
												{/each}
											</ul>
										</Accordion.Content>
									</Accordion.Item>
								{/if}
							{/if}
						{/each}
					</Accordion.Root>
				</div>
				<div class="w-full">
					<slot />
				</div>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex justify-center p-24">
		<MustLogin />
	</div>
{/if}
