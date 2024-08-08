<script lang="ts">
	import Footer from '$lib/components/footer.svelte'
	import Header from '$lib/components/header.svelte'
	import { Toaster } from '$lib/components/ui/sonner'
	import { onMount, tick } from 'svelte'
	import { pwaInfo } from 'virtual:pwa-info'

	import '@fontsource/ibm-plex-mono'
	import '../app.css'

	import { QueryClientProvider } from '@tanstack/svelte-query'
	import { goto, onNavigate } from '$app/navigation'
	import Drawer from '$lib/components/drawer.svelte'
	import { queryClient } from '$lib/fetch/client'
	import { processQueuedInsertions } from '$lib/nostrSubs/data-aggregator'
	import { cleanupCachedEvents } from '$lib/stores/session'

	import type { LayoutData } from './$types'

	export let data: LayoutData
	$: ({
		appSettings: { isFirstTimeRunning, allowRegister },
	} = data)

	onMount(async () => {
		if (isFirstTimeRunning) {
			goto('/setup', { invalidateAll: true })
		}
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register')
			registerSW({
				immediate: true,
				onRegistered(r) {
					// uncomment following code if you want check for updates
					// r && setInterval(() => {
					//    console.log('Checking for sw update')
					//    r.update()
					// }, 20000 /* 20s for testing purposes */)
					console.log(`SW Registered: ${r}`)
				},
				onRegisterError(error) {
					console.log('SW registration error', error)
				},
			})
		}
		cleanupCachedEvents()
	})

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''

	onNavigate(() => {
		tick().then(() => {
			processQueuedInsertions(allowRegister)
		})
	})
</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
<link
	href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
	rel="stylesheet"
/>
<Toaster richColors />

<svelte:head>
	{@html webManifestLink}
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
		rel="stylesheet"
	/>
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="icon" href="/logo.svg" sizes="any" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="/apple-splash-portrait-light-1536x2048.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="/apple-splash-landscape-light-2048x1536.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (prefers-color-scheme: dark) and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
		href="/apple-splash-portrait-dark-1536x2048.png"
	/>
	<link
		rel="apple-touch-startup-image"
		media="screen and (prefers-color-scheme: dark) and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
		href="/apple-splash-landscape-dark-2048x1536.png"
	/>
</svelte:head>
<QueryClientProvider client={queryClient}>
	{#if isFirstTimeRunning}
		<slot />
	{:else}
		<div class="min-h-screen flex flex-col font-sans">
			<Header />
			<section class="flex-1">
				<slot />
			</section>
			<Drawer />
			<Footer />
		</div>
	{/if}
</QueryClientProvider>

<style>
	:global(body) {
		font-family: 'IBM Plex Mono', monospace;
	}
</style>
