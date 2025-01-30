<script lang="ts">
	import type { NsecAccount } from '$lib/stores/session'
	import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import PassPromt from '$lib/components/passPromt.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { login, loginWithNostrConnect, logout, NOSTR_CONNECT_KEY, NOSTR_LOCAL_SIGNER_KEY } from '$lib/ndkLogin'
	import { breakpoint } from '$lib/stores/breakpoint'
	import { unreadCounts } from '$lib/stores/chat-notifications'
	import { dialogs } from '$lib/stores/dialog'
	import ndkStore from '$lib/stores/ndk'
	import { balanceOfWorkingNWCs } from '$lib/stores/nwc'
	import { getAccount } from '$lib/stores/session'
	import { clickOutside } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from '../../routes/$types'
	import CartWithState from './cart/cart-with-state.svelte'
	import AuthDialog from './dialogs/authDialog.svelte'
	import CAvatar from './ui/custom-components/c-avatar.svelte'

	$: ({ appSettings } = $page.data as PageData)

	let showPassPromt: boolean = false
	let nsecAccInfo: NsecAccount
	let showBackToTop = false
	onMount(async () => {
		const lastAccount = localStorage.getItem('last_account')
		const autoLogin = localStorage.getItem('auto_login') ? JSON.parse(localStorage.getItem('auto_login') as string) : undefined

		const signerPrivateKey = localStorage.getItem(NOSTR_LOCAL_SIGNER_KEY)
		const bunkerUrl = localStorage.getItem(NOSTR_CONNECT_KEY)

		if (signerPrivateKey && bunkerUrl) {
			if (!autoLogin) return
			const signer = new NDKPrivateKeySigner(signerPrivateKey)
			await loginWithNostrConnect({ signer, bunkerUrl, localPrivateKey: signerPrivateKey })
		} else if (lastAccount && autoLogin) {
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
	$: hasUnreadMessages = Object.values($unreadCounts).some((count) => count > 0)

	function showAuthDialog() {
		dialogs.show(AuthDialog)
	}
	let open = false

	function handleClickOutside() {
		open = false
	}

	function handleScroll() {
		if (!browser) return
		showBackToTop = window.scrollY > 600
	}

	function scrollToTop() {
		if (!browser) return
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	$: currentPath = $page.url.pathname
	const navMenuButtonStyle = 'gap-4 py-8 px-6 justify-start'
	const navMenuLabels = 'font-bold'
	const activeNavClass = 'text-secondary font-bold'
	const activeMenuItemClass = 'bg-secondary text-primary'
	const activeNavButtonClass = 'bg-secondary text-primary hover:text-secondary'

	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', handleScroll)
			return () => window.removeEventListener('scroll', handleScroll)
		}
	})
</script>

<PassPromt dialogOpen={showPassPromt} accointInfo={nsecAccInfo} />

<header class="sticky top-0 z-30 bg-black py-4 text-white px-4">
	<div class="container flex h-full max-w-full items-center justify-between">
		<section class="inline-flex items-center">
			<a href="/">
				<div class="flex items-center">
					<img src={appSettings?.logoUrl} alt="logo" class="w-16 px-2" />
					<span class="font-semibold hidden lg:block lg:text-2xl">{appSettings?.instanceName}</span>
				</div>
			</a>
			<div class="hidden sm:flex mx-8 gap-8">
				<a class="hover:underline font-semibold {currentPath.startsWith('/products') ? activeNavClass : ''}" href="/products/">Products</a>
				<a class="hover:underline font-semibold {currentPath.startsWith('/community') ? activeNavClass : ''}" href="/community/"
					>Community</a
				>
				<a class="hover:underline font-semibold {currentPath.startsWith('/nostr') ? activeNavClass : ''}" href="/nostr">Nostr</a>
			</div>
		</section>
		<div class="flex items-center gap-4">
			{#if $ndkStore.activeUser}
				<a href={`/p/${$ndkStore.activeUser.profile?.nip05 ? $ndkStore.activeUser.profile?.nip05 : $ndkStore.activeUser.pubkey}`}>
					<CAvatar
						pubkey={$ndkStore.activeUser.pubkey}
						profile={$ndkStore.activeUser.profile}
						avatarClass="rounded-md border-2 {currentPath.startsWith('/p/') ? 'border-secondary' : 'border-primary'}"
						imageClass="rounded-md"
						fallbackClass="rounded-md"
					/>
				</a>
			{/if}
			<div class="flex gap-2">
				<CartWithState />
			</div>
			{#if $ndkStore.activeUser}
				{#if $breakpoint === 'sm'}
					<div use:clickOutside={() => handleClickOutside()}>
						<Collapsible.Root bind:open>
							<Collapsible.Trigger asChild let:builder>
								<Button builders={[builder]} variant="primary" class="p-2 rounded-md hover:[&>span]:text-secondary">
									{#if open}
										<span class="i-tdesign-close w-6 h-6" />
									{:else}
										<span class="i-tdesign-view-list w-6 h-6" />
									{/if}
								</Button>
							</Collapsible.Trigger>

							<Collapsible.Content class="absolute left-0 right-0 bg-secondary-foreground mt-4">
								<div>
									{#if $ndkStore.activeUser}
										{#if $balanceOfWorkingNWCs}
											<div class="flex items-center gap-2">
												<span class="i-bitcoin-icons-satoshi-v1-outline w-6 h-6" />
												<span>{$balanceOfWorkingNWCs} sats</span>
											</div>
										{/if}

										<nav class="flex flex-col">
											<Button
												variant="none"
												href="/dash/messages"
												class="{navMenuButtonStyle} {currentPath.startsWith('/dash/messages') ? activeMenuItemClass : ''}"
												on:click={() => (open = false)}
											>
												<span class="i-tdesign-mail w-6 h-6 {hasUnreadMessages ? 'text-secondary' : ''}" />
												<span class={navMenuLabels}>{hasUnreadMessages ? 'Messages' : 'Messages'}</span>
											</Button>

											<Button
												variant="none"
												href="/settings"
												class="{navMenuButtonStyle} {currentPath.startsWith('/settings') ? activeMenuItemClass : ''}"
												on:click={() => (open = false)}
											>
												<span class="i-tdesign-setting-1 w-6 h-6" />
												<span class={navMenuLabels}>Settings</span>
											</Button>

											<Button
												variant="none"
												href="/dash"
												class="{navMenuButtonStyle} {currentPath === '/dash' ? activeMenuItemClass : ''}"
												on:click={() => (open = false)}
											>
												<span class="i-tdesign-dashboard w-6 h-6" />
												<span class={navMenuLabels}>Dashboard</span>
											</Button>

											<Button
												variant="none"
												href="/products"
												class="{navMenuButtonStyle} {currentPath.startsWith('/products') ? activeMenuItemClass : ''}"
												on:click={() => (open = false)}
											>
												<span class="i-mdi-package-variant-closed w-7 h-7" />
												<span class={navMenuLabels}>Products</span>
											</Button>

											<Button
												variant="none"
												href="/community"
												class="{navMenuButtonStyle} {currentPath.startsWith('/community') ? activeMenuItemClass : ''}"
												on:click={() => (open = false)}
											>
												<span class="i-tdesign-shop w-6 h-6" />
												<span class={navMenuLabels}>Community</span>
											</Button>

											<Button
												variant="none"
												href="/nostr"
												class="{navMenuButtonStyle} {currentPath.startsWith('/nostr') ? activeMenuItemClass : ''}"
												on:click={() => (open = false)}
											>
												<span class="i-tdesign-compass w-6 h-6" />
												<span class={navMenuLabels}>Nostr</span>
											</Button>

											<Button
												variant="none"
												class="{navMenuButtonStyle} bg-foreground"
												on:click={() => {
													logout()
													open = false
												}}
											>
												<span class="i-tdesign-user-arrow-right text-secondary w-6 h-6" />
												<span class="text-secondary {navMenuLabels}">Log out</span>
											</Button>
										</nav>
									{/if}
								</div>
							</Collapsible.Content>
						</Collapsible.Root>
					</div>
				{:else}
					<Button
						variant="primary"
						class="sm:flex p-2 relative rounded-md {currentPath === '/dash' ? activeNavButtonClass : 'hover:[&>span]:text-secondary'}"
						href="/dash"
						id="dash-button"
					>
						<span class="i-tdesign-dashboard w-6 h-6" />
					</Button>

					<Button
						variant="primary"
						class="sm:flex p-2 relative rounded-md {currentPath.startsWith('/settings')
							? activeNavButtonClass
							: 'hover:[&>span]:text-secondary'}"
						href="/settings"
						id="settings-button"
					>
						<span class="i-tdesign-setting-1 w-6 h-6" />
					</Button>

					<Button
						variant="primary"
						class="sm:flex p-2 relative rounded-md {currentPath.startsWith('/dash/messages')
							? activeNavButtonClass
							: 'hover:[&>span]:text-secondary'}"
						href="/dash/messages"
						id="msg-button"
					>
						<span class="i-tdesign-mail w-6 h-6 {hasUnreadMessages ? 'text-secondary' : ''}" />
					</Button>

					<Button
						variant="primary"
						class="sm:flex p-2 relative rounded-md hover:[&>span]:text-secondary"
						on:click={() => {
							logout()
							open = false
						}}
					>
						<span class="i-tdesign-user-arrow-right w-6 h-6" />
					</Button>
				{/if}
			{:else}
				<Button
					variant="primary"
					class="sm:flex p-2 relative rounded-md hover:[&>span]:text-secondary"
					on:click={showAuthDialog}
					id="login-button"
				>
					<span class="i-tdesign-user-1 w-6 h-6" />
				</Button>
			{/if}
		</div>
	</div>
	<div
		class={`fixed bottom-6 right-6 z-50 transition-opacity duration-200 ${showBackToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
	>
		<Button variant="secondary" size="icon" class="rounded-full shadow-lg hover:opacity-90" on:click={scrollToTop}>
			<span class="i-tdesign-chevron-up w-6 h-6" />
		</Button>
	</div>
</header>
