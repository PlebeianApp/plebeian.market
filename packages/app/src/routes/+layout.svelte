<script lang="ts">
	import Footer from '$lib/components/footer.svelte'
	import Header from '$lib/components/header.svelte'
	import { Toaster } from '$lib/components/ui/sonner'
	import { onMount } from 'svelte'

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
		console.log(lastAccount, autoLogin)
		if (lastAccount && autoLogin) {
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
</script>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
<link
	href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
	rel="stylesheet"
/>
<Toaster richColors />
<Header />
<PassPromt dialogOpen={showPassPromt} accointInfo={nsecAccInfo} />
<slot />
<Footer />
