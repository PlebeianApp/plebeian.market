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

	function findRoute(path: string) {
		return menuItems.flatMap((item) => item.links).find((link) => path === link.href || path.startsWith(link.href + '/'))?.href
	}

	$: currentPath = $page.url.pathname
	$: matchedPath = findRoute(currentPath)
	$: currentMenuInfo = menuItems.flatMap((item) => item.links).find((link) => matchedPath === link.href)
	$: parentMenuItem = menuItems.find((item) => item.links.some((link) => matchedPath === link.href))
	$: userExist = $ndkStore.activeUser?.pubkey ? createUserExistsQuery($ndkStore.activeUser?.pubkey) : undefined
	$: if (!$activeUserQuery.data?.role) $activeUserQuery.refetch()
	$: isMobile = $breakpoint == 'sm'
</script>

{#if $ndkStore.activeUser?.pubkey}
	<div class="mx-auto">
		{#if isMobile}
			<div class="w-full">
				<div class="flex items-center py-4 px-1 bg-black">
					{#if currentMenuInfo}
						<a
							href={currentPath == currentMenuInfo.href ? `/dash` : currentMenuInfo.href}
							class="absolute left-2 m-0 p-2 leading-none text-white"
						>
							<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
						</a>

						<div class="inline-flex items-center justify-center w-full px-8">
							<div class="flex flex-wrap gap-1 items-center justify-center max-w-[80vw] overflow-hidden">
								<span class="text-white text-md truncate">
									<a href="/dash">{parentMenuItem?.value}</a>
								</span>
								<h2 class="text-xl m-0 text-secondary truncate">
									/{currentMenuInfo.title.replace(/^[^a-zA-Z]+/, '')}
								</h2>
							</div>
						</div>
					{:else}
						<h2 class="text-4xl m-0 w-full text-center text-secondary">
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
														<a
															href={link.href}
															id={`${link.title.replace(/^[^a-zA-Z]+/, '').toLocaleLowerCase()}-button`}
															class="block p-2 hover:bg-gray-100 rounded"
														>
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
			<div class="grid grid-cols-[auto_2fr] gap-6 p-4">
				<!-- Navigation Menu -->
				<nav class="space-y-4 max-w-xl">
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
													<a
														href={link.href}
														id={`${link.title.replace(/^[^a-zA-Z]+/, '').toLocaleLowerCase()}-button`}
														class="block p-2 hover:bg-gray-100 rounded {currentPath === link.href ? 'bg-gray-300' : ''}"
													>
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
				<div class="w-full flex flex-col max-w-xl md:max-w-2xl lg:max-w-3xl gap-2 border p-4 rounded bg-white">
					{#if currentMenuInfo}
						<div class="flex items-center p-3 rounded px-1 bg-black">
							<div class="inline-flex gap-4 items-end w-full px-2">
								<a href={currentPath == currentMenuInfo.href ? `/dash` : currentMenuInfo.href} class=" m-0 leading-none text-white">
									<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
								</a>
								<div class="flex flex-wrap gap-1 items-center justify-center max-w-[80vw] overflow-hidden">
									<span class="text-white text-md truncate">
										<a href="/dash">{parentMenuItem?.value}</a>
									</span>
									<h2 class="text-2xl m-0 text-secondary truncate">
										/{currentMenuInfo.title}
									</h2>
								</div>
							</div>
						</div>
					{/if}
					<div class="">
						<slot />
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex justify-center p-24">
		<MustLogin />
	</div>
{/if}
