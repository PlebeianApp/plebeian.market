<script lang="ts">
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
	import Footer from '$lib/components/footer.svelte'
	import Header from '$lib/components/header.svelte'
	import { Toaster } from '$lib/components/ui/sonner'
	import { onMount } from 'svelte'
	import { pwaInfo } from 'virtual:pwa-info'

	import '@fontsource/ibm-plex-mono'
	import '../app.css'

	import { QueryClientProvider } from '@tanstack/svelte-query'
	import { browser } from '$app/environment'
	import { afterNavigate, goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { externalLinks } from '$lib/actions/external-links'
	import RelayReportWidget from '$lib/components/assets/relayReportWidget.svelte'
	import RelayWidget from '$lib/components/assets/relayWidget.svelte'
	import BetaDialog from '$lib/components/dialogs/betaDialog.svelte'
	import Drawer from '$lib/components/drawer.svelte'
	import Pattern from '$lib/components/Pattern.svelte'
	import SellStuffAdvert from '$lib/components/sell-stuff-advert.svelte'
	import DialogManager from '$lib/components/ui/dialogManager.svelte'
	import { queryClient } from '$lib/fetch/client'
	import { productKeys } from '$lib/fetch/query-key-factory'
	import { processQueuedInsertions } from '$lib/nostrSubs/data-aggregator'
	import { dialogs } from '$lib/stores/dialog'
	import ndkStore from '$lib/stores/ndk'
	import { initNdkNWCs } from '$lib/stores/nwc'
	import { relayReports } from '$lib/stores/relayReports'
	import { cleanupCachedEvents, getAllAccounts, sessions } from '$lib/stores/session'
	import { setupDMSubscription } from '$lib/utils/dm.utils'

	import type { LayoutData } from './$types'

	export let data: LayoutData

	for (const [currency, price] of data.prices) {
		queryClient.setQueryData(productKeys.currency.base(currency), price)
	}

	$: isLoggedIn = browser && $ndkStore.activeUser

	onMount(async () => {
		if (data.appSettings?.isFirstTimeRunning) {
			goto('/setup', { invalidateAll: true })
		}
		const userForbiddenPattern = localStorage.getItem('forbiddenPattern')
		const instanceForbiddenPattern = data.forbiddenWords.forbiddenPattern.toString()
		if (instanceForbiddenPattern == userForbiddenPattern) {
			cleanupCachedEvents()
		} else {
			sessions.cachedEvents.clear()
			localStorage.setItem('forbiddenPattern', instanceForbiddenPattern)
		}
	})

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''

	afterNavigate(() => {
		processQueuedInsertions(data.appSettings?.allowRegister)
	})

	// Tooltips on elements with the tooltip attribute
	onMount(async () => {
		const tooltip = document.querySelector('#tooltip') as HTMLDivElement
		const tooltipContent = document.querySelector('#tooltip-content') as HTMLDivElement
		const arrowElement = document.querySelector('#arrow') as HTMLDivElement
		let activeElement: HTMLElement | null = null

		function updateTooltip() {
			if (!activeElement) return

			computePosition(activeElement, tooltip, {
				placement: 'top',
				middleware: [
					offset(6), // Distance between element and tooltip
					flip(), // Auto-flip if there's no space
					shift({ padding: 5 }), // Shift tooltip to avoid screen edges
					arrow({ element: arrowElement }), // Position the arrow
				],
			}).then(({ x, y, placement, middlewareData }) => {
				Object.assign(tooltip.style, {
					left: `${x}px`,
					top: `${y}px`,
				})

				const { x: arrowX, y: arrowY } = middlewareData.arrow!
				const staticSide = {
					top: 'bottom',
					right: 'left',
					bottom: 'top',
					left: 'right',
				}[placement.split('-')[0]]!

				Object.assign(arrowElement.style, {
					left: arrowX != null ? `${arrowX}px` : '',
					top: arrowY != null ? `${arrowY}px` : '',
					[staticSide]: '-4px',
				})
			})
		}

		function showTooltip(element: HTMLElement) {
			tooltipContent.textContent = element.getAttribute('data-tooltip')
			tooltip.style.display = 'block'
			activeElement = element
			updateTooltip()

			autoUpdate(element, tooltip, updateTooltip) // Keep updated on resize/scroll
		}

		function hideTooltip() {
			tooltip.style.display = 'none'
			activeElement = null
		}

		document.body.addEventListener('mouseover', (event) => {
			const target = (event.target as HTMLElement).closest('[data-tooltip]') as HTMLElement
			if (target) {
				showTooltip(target)
			}
		})

		document.body.addEventListener('mouseout', (event) => {
			const relatedTarget = event.relatedTarget as HTMLElement
			if (!relatedTarget || !relatedTarget.closest('#tooltip')) {
				hideTooltip()
			}
		})
		const localUsers = await getAllAccounts()
		if (!localUsers?.length) {
			dialogs.show(BetaDialog, {}, { size: 'lg' })
		}
	})

	$: if (browser)
		document.title =
			$page.url.pathname === '/'
				? data.appSettings?.instanceName || 'PM'
				: `${$page.url.pathname
						.split('/')
						.filter(Boolean)
						.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
						.join(' ')} | ${data.appSettings?.instanceName || 'PM'}`

	$: if (isLoggedIn) {
		initNdkNWCs()
		setupDMSubscription()
	}
</script>

<Toaster richColors />

<svelte:head>
	{@html webManifestLink}
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
	<meta name="theme-color" content="#000000" />
	<meta name="apple-mobile-web-app-status-bar-style" content="#000000" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	{#if data.appSettings?.isFirstTimeRunning}
		<slot />
	{:else}
		<div class="min-h-screen flex flex-col font-sans relative">
			<Header />
			<Pattern pattern="page" class=" opacity-35 -z-10 " />
			<section class="flex-1" use:externalLinks>
				<slot />
			</section>
			<Drawer />
			{#if !isLoggedIn}
				<SellStuffAdvert />
			{/if}
			<Footer />
			<section class="fixed bottom-0 flex">
				<RelayWidget />
				{#if $relayReports?.length}
					<RelayReportWidget />
				{/if}
			</section>
			<DialogManager />
			{#await import('$lib/components/dialogs/reloadDialog.svelte') then { default: ReloadDialog }}
				<ReloadDialog />
			{/await}
		</div>
	{/if}
</QueryClientProvider>

<div id="tooltip" role="tooltip">
	<div id="tooltip-content"></div>
	<div id="arrow"></div>
</div>

<style>
	:global(body) {
		font-family: theme('fontFamily.sans');
	}

	:global(h2) {
		font-family: theme('fontFamily.heading');
		font-synthesis: none;
		font-size: 2.4rem;
		letter-spacing: 0.2rem;
	}
</style>
