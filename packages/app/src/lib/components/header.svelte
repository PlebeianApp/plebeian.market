<script lang="ts">
	import type { NsecAccount } from '$lib/stores/session'
	import { page } from '$app/stores'
	import PassPromt from '$lib/components/passPromt.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { login, logout } from '$lib/ndkLogin'
	import { breakpoint } from '$lib/stores/breakpoint'
	import { unreadCounts } from '$lib/stores/chat-notifications'
	import { dialogs } from '$lib/stores/dialog'
	import ndkStore from '$lib/stores/ndk'
	import { balanceOfWorkingNWCs } from '$lib/stores/nwc'
	import { getAccount } from '$lib/stores/session'
	import { getHexColorFingerprintFromHexPubkey } from '$lib/utils'
	import { onMount } from 'svelte'

	import type { PageData } from '../../routes/$types'
	import CartWithState from './cart/cart-with-state.svelte'
	import AuthDialog from './dialogs/authDialog.svelte'
	import AvatarFallback from './ui/avatar/avatar-fallback.svelte'
	import AvatarImage from './ui/avatar/avatar-image.svelte'
	import Avatar from './ui/avatar/avatar.svelte'
	import CAvatar from './ui/custom-components/c-avatar.svelte'

	$: ({ appSettings } = $page.data as PageData)

	let showPassPromt: boolean = false
	let nsecAccInfo: NsecAccount
	let loginComplete: boolean | undefined

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
		dialogs.show(AuthDialog, {})
	}
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
			<Button variant="primary" class="sm:flex p-2 relative" href="/dash/messages">
				<span class="i-tdesign-mail w-6 h-6"></span>
				{#if hasUnreadMessages}
					<span class="notification-dot" />
				{/if}
			</Button>

			<div class="hidden sm:flex gap-2">
				<CartWithState />
			</div>

			{#if $ndkStore.activeUser}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger id="menuButton">
						<Button variant="primary" class="p-2 "><span class="i-tdesign-view-list w-6 h-6"></span></Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Label>My account</DropdownMenu.Label>
							<DropdownMenu.Label>
								{#if $balanceOfWorkingNWCs}
									<div class="flex flex-col">
										<section class=" inline-flex items-center">
											<span class=" i-bitcoin-icons-satoshi-v1-outline w-6 h-6" />{$balanceOfWorkingNWCs} sats
										</section>
									</div>
								{/if}
							</DropdownMenu.Label>
							{#if $ndkStore.activeUser}
								<DropdownMenu.Separator />
								<DropdownMenu.Item>
									<a
										href={`/p/${$ndkStore.activeUser.profile?.nip05 ? $ndkStore.activeUser.profile?.nip05 : $ndkStore.activeUser.pubkey}`}
										class="inline-flex items-center gap-2 w-full"><span class="i-tdesign-user-1" />Profile</a
									>
								</DropdownMenu.Item>
								<DropdownMenu.Item>
									<a id="headerMenuSettings" href="/settings" class="inline-flex items-center gap-2 w-full"
										><span class="i-tdesign-user-setting" />Settings</a
									>
								</DropdownMenu.Item>
								<DropdownMenu.Item>
									<a id="headerMenuDashboard" href="/dash" class="inline-flex items-center gap-2 w-full"
										><span class=" i-tdesign-dashboard" />Dashboard</a
									>
								</DropdownMenu.Item>
								{#if $breakpoint !== 'lg'}
									<DropdownMenu.Separator />

									<DropdownMenu.Item>
										<a class="hover:underline font-semibold" href="/stalls/">Market</a>
									</DropdownMenu.Item>
									<DropdownMenu.Item>
										<a class="hover:underline font-semibold" href="/square">Square</a>
									</DropdownMenu.Item>
									<DropdownMenu.Separator />

									<DropdownMenu.Item class="flex items-center justify-between gap-2">
										<Button variant="primary" class="p-2 relative" href="/dash/messages">
											<span class="i-tdesign-mail text-black w-6 h-6"></span>
											{#if hasUnreadMessages}
												<span class="notification-dot" />
											{/if}
										</Button>

										<CartWithState />
									</DropdownMenu.Item>
								{/if}
								<DropdownMenu.Item>
									<Button
										variant="destructive"
										id="headerMenuLogOut"
										class="inline-flex items-center gap-2 w-full"
										on:click={() => {
											logout()
											loginComplete = false
										}}><span class="i-tdesign-user-arrow-right"></span>Log out</Button
									>
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<Button variant="primary" on:click={showAuthDialog} class="flex items-center cursor-pointer gap-2 w-full">
					<span class="i-tdesign-user-1" />Login/Register
				</Button>
			{/if}
		</div>
	</div>
</header>
