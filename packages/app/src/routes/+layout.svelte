<script lang="ts">
	import Footer from '$lib/components/footer.svelte'
	import Header from '$lib/components/header.svelte'
	import { Toaster } from '$lib/components/ui/sonner'
	import { onMount } from 'svelte'
	import { pwaInfo } from 'virtual:pwa-info'

	import '../app.css'

	import type { NsecAccount } from '$lib/stores/session'
	import PassPromt from '$lib/components/passPromt.svelte'
	import { login } from '$lib/ndkLogin'
	import { getAccount } from '$lib/stores/session'

	let showPassPromt: boolean = false
	let nsecAccInfo: NsecAccount

	onMount(async () => {
		const lastAccount = localStorage.getItem('last_account')
		const autoLogin = localStorage.getItem('auto_login')
		if (lastAccount && autoLogin != 'false') {
			const accountInfo = await getAccount(lastAccount)
			if (!accountInfo) return
			if (accountInfo.type == 'NIP07') {
				await login(accountInfo?.type)
			} else if (accountInfo.type == 'NSEC') {
				showPassPromt = true
				nsecAccInfo = accountInfo
			}
		}
	})

	onMount(async () => {
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
	})

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : ''
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
<Header />
<PassPromt dialogOpen={showPassPromt} accointInfo={nsecAccInfo} />
<slot />
<Footer />
