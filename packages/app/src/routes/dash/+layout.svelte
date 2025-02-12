<script lang="ts">
	import { page } from '$app/stores'
	import MustLogin from '$lib/components/assets/mustLogin.svelte'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { activeUserQuery, createUserExistsQuery } from '$lib/fetch/users.queries'
	import { breakpoint } from '$lib/stores/breakpoint'
	import ndkStore from '$lib/stores/ndk'
	import { shouldShowItem } from '$lib/utils'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ menuItems } = data)

	$: currentPath = $page.url.pathname
	$: currentMenuInfo = menuItems.flatMap((item) => item.links).find((link) => currentPath === link.href)
	$: parentMenuItem = menuItems.find((item) => item.links.some((link) => currentPath === link.href))
	$: userExist = $ndkStore.activeUser?.pubkey ? createUserExistsQuery($ndkStore.activeUser?.pubkey) : undefined
	$: if (!$activeUserQuery.data?.role) $activeUserQuery.refetch()
	$: isMobile = $breakpoint == 'sm'
</script>

{#if $ndkStore.activeUser?.pubkey}
	<div class="mx-auto">
		{#if isMobile}
			<div class="w-full">
				<div class="relative flex items-center py-4 px-1 bg-black">
					{#if parentMenuItem}
						<a href="/dash" class="absolute left-2 p-2 h-fit text-white">
							<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
						</a>
						<h2 class="text-4xl m-0 w-full text-center text-white">{parentMenuItem.value}</h2>
					{:else}
						<h2 class="text-4xl m-0 w-full text-center text-white">
							<a href="/dash">Dashboard</a>
						</h2>
					{/if}
				</div>

				{#if parentMenuItem}
					<div class="flex flex-col gap-2">
						<Separator />
						<div class="w-full p-4">
							<slot />
						</div>
					</div>
				{:else}
					<div class="flex flex-col justify-center items-center gap-2 py-4 px-1">
						<nav class="space-y-4 w-full px-4">
							{#each menuItems as item}
								{#if shouldShowItem(item, $userExist?.data?.exists, $activeUserQuery.data?.role)}
									<div class="space-y-2 mb-5">
										<div class="bg-black p-3 rounded">
											<span class="text-white font-heading text-2xl">{item.title}</span>
										</div>
										<ul class="space-y-2">
											{#each item.links as link}
												{#if link.public || ($userExist?.data?.exists && !$userExist?.data?.banned)}
													<li>
														<a href={link.href} class="block p-2 hover:bg-gray-100 rounded">
															{link.title}
														</a>
													</li>
												{/if}
											{/each}
										</ul>
									</div>
								{/if}
							{/each}
						</nav>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Desktop Layout -->
			<div class="bg-primary p-4">
				<h2 class="text-4xl m-0 text-left text-secondary"><a href="/dash">Dashboard</a></h2>
			</div>
			<div class="grid grid-cols-[1fr_2fr] gap-6 p-4">
				<!-- Navigation Menu -->
				<nav class="space-y-4">
					<div class="border p-4 rounded bg-white">
						{#each menuItems as item}
							{#if shouldShowItem(item, $userExist?.data?.exists, $activeUserQuery.data?.role)}
								<div class="space-y-2 mb-5">
									<div class=" bg-black p-3 rounded">
										<span class="text-white font-heading text-2xl">{item.title}</span>
									</div>
									<ul class="space-y-2">
										{#each item.links as link}
											{#if link.public || ($userExist?.data?.exists && !$userExist?.data?.banned)}
												<li>
													<a href={link.href} class="block p-2 hover:bg-gray-100 rounded">
														{link.title}
													</a>
												</li>
											{/if}
										{/each}
									</ul>
								</div>
							{/if}
						{/each}
					</div>
				</nav>

				<!-- Content Area -->
				<div class="w-full border p-4 rounded bg-white">
					<slot />
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex justify-center p-24">
		<MustLogin />
	</div>
{/if}
