<script lang="ts">
	import type { NsecAccount } from '$lib/stores/session'
	import { page } from '$app/stores'
	import Auth from '$lib/components/auth.svelte'
	import PassPromt from '$lib/components/passPromt.svelte'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { login, logout } from '$lib/ndkLogin'
	import ndkStore from '$lib/stores/ndk'
	import { balanceOfWorkingNWCs } from '$lib/stores/nwc'
	import { getAccount } from '$lib/stores/session'
	import { onMount } from 'svelte'

	import type { PageData } from '../../routes/$types'
	import CartWithState from './cart/cart-with-state.svelte'
	import CAvatar from './ui/custom-components/c-avatar.svelte'

	$: ({ appSettings } = $page.data as PageData)

	let showPassPromt: boolean = false
	let nsecAccInfo: NsecAccount
	let loginComplete: boolean = false

	const handleLoginComplete = () => {
		loginComplete = true
	}

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
</script>

<PassPromt dialogOpen={showPassPromt} accointInfo={nsecAccInfo} />

<header class="sticky top-0 z-30 bg-black px-4 py-4 text-white lg:px-12">
	<div class="container flex h-full w-full items-center justify-between">
		<section class=" inline-flex items-center">
			<a href="/">
				<div class="flex items-center">
					<img src={appSettings.logoUrl} alt="logo" class="w-16 px-2" />
					<span class="font-semibold text-2xl">{appSettings.instanceName}</span>
				</div>
			</a>
			<div class="hidden lg:flex mx-8 gap-8">
				<a class="hover:underline font-semibold" href="/stalls/">Stall Browser</a>
				<a class="hover:underline font-semibold" href="/market">Market Square</a>
				<a class="hover:underline font-semibold" href="/">Plebeian Planet</a>
			</div>
		</section>
		<div class="flex items-center gap-4">
			<Button class="hidden sm:flex p-2 bg-[var(--neo-yellow)]" href="/dash/messages"
				><span class="i-tdesign-mail text-black w-6 h-6"></span></Button
			>
			<CartWithState />
			{#if $ndkStore.activeUser && loginComplete}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger id="menuButton">
						<Button class="p-2 bg-white"><span class="i-tdesign-view-list text-black w-6 h-6"></span></Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Label>
								<Auth on:loginComplete={handleLoginComplete} />
								My account
							</DropdownMenu.Label>
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
								<DropdownMenu.Item>
									<Button id="headerMenuLogOut" variant="destructive" class="inline-flex items-center gap-2" on:click={() => logout()}
										><span class="i-tdesign-user-arrow-right"></span>Log out</Button
									>
								</DropdownMenu.Item>
							{/if}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
				<a href={`/p/${$ndkStore.activeUser.profile?.nip05 ? $ndkStore.activeUser.profile?.nip05 : $ndkStore.activeUser.pubkey}`}>
					<CAvatar pubkey={$ndkStore.activeUser.pubkey} profile={$ndkStore.activeUser.profile} />
				</a>
			{:else}
				<Auth on:loginComplete={handleLoginComplete} />
			{/if}
		</div>
	</div>
</header>
