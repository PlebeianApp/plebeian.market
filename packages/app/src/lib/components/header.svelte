<script lang="ts">
	import type { NsecAccount } from '$lib/stores/session'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import PassPromt from '$lib/components/passPromt.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { login, logout } from '$lib/ndkLogin'
	import { breakpoint } from '$lib/stores/breakpoint'
	import { unreadCounts } from '$lib/stores/chat-notifications'
	import { dialogs } from '$lib/stores/dialog'
	import ndkStore from '$lib/stores/ndk'
	import { balanceOfWorkingNWCs } from '$lib/stores/nwc'
	import { getAccount } from '$lib/stores/session'
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'

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
	$: hasUnreadMessages = Object.values($unreadCounts).some((count) => count > 0)

	function showAuthDialog() {
		dialogs.show(AuthDialog)
	}
	let open = false

	function clickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				open = false
			}
		}
		document.addEventListener('click', handleClick, true)
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true)
			},
		}
	}

	const navMenuButtonStyle = 'gap-4 py-8 px-6 justify-start'
	const navMenuLabels = 'font-bold'

	function handleScroll() {
		if (!browser) return
		showBackToTop = window.scrollY > 600
	}

	function scrollToTop() {
		if (!browser) return
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', handleScroll)
			return () => window.removeEventListener('scroll', handleScroll)
		}
	})
</script>

<PassPromt dialogOpen={showPassPromt} accointInfo={nsecAccInfo} />

<header class="sticky top-0 z-30 bg-black px-0 py-4 text-white md:px-4 lg:px-12">
	<div class="container flex h-full w-full items-center justify-between">
		<section class=" inline-flex items-center">
			<a href="/">
				<div class="flex items-center">
					<img src={appSettings?.logoUrl} alt="logo" class="w-16 px-2" />
					<span class="font-semibold hidden md:block md:text-2xl">{appSettings?.instanceName}</span>
				</div>
			</a>
			<div class="hidden sm:flex mx-8 gap-8">
				<a class="hover:underline font-semibold" href="/stalls/">Market</a>
				<a class="hover:underline font-semibold" href="/square">Square</a>
			</div>
		</section>
		<div class="flex items-center gap-4">
			{#if $ndkStore.activeUser}
				<a href={`/p/${$ndkStore.activeUser.profile?.nip05 ? $ndkStore.activeUser.profile?.nip05 : $ndkStore.activeUser.pubkey}`}>
					<CAvatar
						pubkey={$ndkStore.activeUser.pubkey}
						profile={$ndkStore.activeUser.profile}
						avatarClass="rounded-md border-secondary border-2"
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
					<div use:clickOutside>
						<Collapsible.Root bind:open>
							<Collapsible.Trigger asChild let:builder>
								<Button builders={[builder]} variant="secondary" class="p-2 rounded-md">
									{#if open}
										<span class=" i-tdesign-close w-6 h-6" />
									{:else}
										<span class="i-tdesign-view-list w-6 h-6" />
									{/if}
								</Button>
							</Collapsible.Trigger>

							<Collapsible.Content class="absolute left-0 right-0 bg-primary-foreground mt-5">
								<div>
									{#if $ndkStore.activeUser}
										<!-- Balance Section -->
										{#if $balanceOfWorkingNWCs}
											<div class="flex items-center gap-2">
												<span class="i-bitcoin-icons-satoshi-v1-outline w-6 h-6" />
												<span>{$balanceOfWorkingNWCs} sats</span>
											</div>
										{/if}

										<!-- Navigation Links -->
										<nav class="flex flex-col">
											<Button variant="none" href="/dash/messages" class={navMenuButtonStyle} on:click={() => (open = false)}>
												{#if hasUnreadMessages}
													<span class="i-tdesign-mail w-6 h-6 text-primary" />
													<span class={`${navMenuLabels} text-primary`}>Messages</span>
												{:else}
													<span class="i-tdesign-mail w-6 h-6" />
													<span class={navMenuLabels}>Messages</span>
												{/if}
											</Button>

											<Button variant="none" href="/settings" class={navMenuButtonStyle} on:click={() => (open = false)}>
												<span class="i-tdesign-setting-1 w-6 h-6" />
												<span class={navMenuLabels}>Settings</span>
											</Button>

											<Button variant="none" href="/dash" class={navMenuButtonStyle} on:click={() => (open = false)}>
												<span class="i-tdesign-dashboard w-6 h-6" />
												<span class={navMenuLabels}>Dashboard</span>
											</Button>

											<Button variant="none" href="/stalls" class={navMenuButtonStyle} on:click={() => (open = false)}>
												<span class="i-tdesign-shop w-6 h-6" />
												<span class={navMenuLabels}>Market</span>
											</Button>

											<Button variant="none" href="/square" class={navMenuButtonStyle} on:click={() => (open = false)}>
												<span class="i-tdesign-compass w-6 h-6" />
												<span class={navMenuLabels}>Square</span>
											</Button>

											<Button
												variant="none"
												class={`${navMenuButtonStyle} bg-foreground`}
												on:click={() => {
													logout()
													open = false
												}}
											>
												<span class="i-tdesign-user-arrow-right text-primary w-6 h-6" />
												<span class={`${navMenuLabels} text-primary`}>Log out</span>
											</Button>
										</nav>
									{/if}
								</div>
							</Collapsible.Content>
						</Collapsible.Root>
					</div>
				{:else}
					<Button variant="primary" class="sm:flex p-2 relative rounded-md" href="/dash" id="dash-button">
						<span class=" i-tdesign-dashboard w-6 h-6"></span>
					</Button>
					<Button variant="primary" class="sm:flex p-2 relative rounded-md" href="/settings" id="settings-button">
						<span class="i-tdesign-setting-1 w-6 h-6"></span>
					</Button>
					<Button variant="primary" class="sm:flex p-2 relative rounded-md" href="/dash/messages" id="msg-button">
						<span class="i-tdesign-mail w-6 h-6"></span>
						{#if hasUnreadMessages}
							<span class="notification-dot" />
						{/if}
					</Button>
					<Button
						variant="primary"
						class="sm:flex p-2 relative rounded-md"
						on:click={() => {
							logout()
							open = false
						}}
					>
						<span class="i-tdesign-user-arrow-right w-6 h-6" />
					</Button>
				{/if}
			{:else}
				<Button variant="primary" class="sm:flex p-2 relative rounded-md" on:click={showAuthDialog} id="login-button">
					<span class="i-tdesign-user-1 w-6 h-6"></span>
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
