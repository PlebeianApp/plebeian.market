<script lang="ts">
	import { afterNavigate, beforeNavigate } from '$app/navigation'
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

	let showingContent = false
	$: isMobile = $breakpoint !== 'lg'
</script>

{#if $ndkStore.activeUser?.pubkey}
	<div class="mx-auto">
		{#if isMobile}
			<!-- Mobile Layout -->
			<div class="w-full">
				{#if showingContent}
					<!-- Content View -->
					<div class=" flex flex-col gap-2">
						<div class="relative flex items-center py-4 px-1 bg-black">
							<button class="absolute left-2 p-2 h-fit text-white" on:click={() => (showingContent = false)}>
								<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
							</button>
							<h2 class="text-4xl m-0 w-full text-center text-white">{parentMenuItem?.value}</h2>
						</div>
						<div class="flex justify-center items-center gap-1">
							<section>
								<h3 class="text-lg font-bold">{currentMenuInfo?.title}</h3>
								<p class="text-gray-600">{currentMenuInfo?.description}</p>
							</section>
						</div>
						<Separator />
					</div>
					<div class="w-full p-4">
						<slot />
					</div>
				{:else}
					<!-- Menu View -->
					<div class="relative flex items-center justify-center py-4 px-1 bg-black">
						<h2 class="text-4xl m-0 w-full text-center text-white">Dashboard</h2>
					</div>
					<div class="flex flex-col justify-center items-center gap-2 py-4 px-1">
						<nav class="space-y-4">
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
														<a href={link.href} class="block p-2 hover:bg-gray-100 rounded" on:click={() => (showingContent = true)}>
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
			<div class="grid grid-cols-[1fr_2fr] gap-8 p-4">
				<!-- Navigation Menu -->
				<nav class="space-y-4">
					<h2 class="mb-4">Dashboard</h2>
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
													<a href={link.href} class="block p-2 hover:bg-gray-100 rounded" on:click={() => (showingContent = true)}>
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
				<div class="w-full">
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
