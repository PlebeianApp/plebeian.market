<script lang="ts">
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Skeleton } from '$lib/components/ui/skeleton/index.js'
	import { standardDisplayDateFormat } from '$lib/constants'
	import { createUserByIdQuery } from '$lib/fetch/users.queries'
	import { login } from '$lib/ndkLogin'
	import { type BaseAccount, type NsecAccount } from '$lib/stores/session'
	import { getProfileName } from '$lib/utils/userProfile.utils'
	import { format } from 'date-fns'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import type { PageData } from '../../routes/$types'
	import Spinner from './assets/spinner.svelte'
	import Hero from './common/hero.svelte'
	import SkeletonLoader from './common/skeletonLoader.svelte'
	import Checkbox from './ui/checkbox/checkbox.svelte'
	import CAvatar from './ui/custom-components/c-avatar.svelte'
	import Label from './ui/label/label.svelte'

	$: ({ appSettings } = $page.data as PageData)
	export let dialogOpen = false
	export let accointInfo: NsecAccount

	let isLoading = false

	let checked: boolean
	async function loginWrapper(loginMethod: BaseAccount['type'], formData?: FormData) {
		isLoading = true
		;(await login(loginMethod, formData)) ? toast.success('Login sucess!') : toast.error('Login error!')
		isLoading = false
		dialogOpen = false
	}

	$: {
		if (browser && checked != undefined) {
			localStorage.setItem('auto_login', `${checked}`)
		}
	}

	$: userQuery = createUserByIdQuery(accointInfo?.hexPubKey)

	onMount(() => {
		if (localStorage.getItem('auto_login') == 'true') {
			checked = true
		} else {
			checked = false
		}
	})
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="max-w-[425px] gap-0 p-0 text-black overflow-hidden">
		<Hero py="0">
			<Dialog.Header class="relative text-center text-white py-8 flex items-center">
				<div class="flex flex-row gap-2 items-center">
					{#if isLoading}
						<Spinner size={60} />
					{:else}
						<img src={appSettings.logoUrl} alt="logo" class="w-16" />
					{/if}
				</div>
			</Dialog.Header>
		</Hero>
		<section class="p-4 flex flex-col gap-2">
			<span>Log with your last account</span>
			<div class=" inline-flex w-full items-center gap-2">
				{#if $userQuery.isLoading}
					<div class="flex items-center space-x-4">
						<Skeleton class="h-12 w-12 rounded-full" />
						<div class="space-y-2">
							<SkeletonLoader count={2} class="h-4 w-[200px]" />
						</div>
					</div>
				{:else if $userQuery?.data}
					<CAvatar pubkey={accointInfo.hexPubKey} profile={$userQuery.data} />
					<section class="flex flex-col">
						<span class="font-bold">{getProfileName($userQuery.data, accointInfo.hexPubKey)}</span>
						<span>{npubEncode(accointInfo.hexPubKey).substring(0, 16)}...</span>
					</section>
				{/if}
			</div>
			<small>Last logged: {format(accointInfo.lastLogged, standardDisplayDateFormat)}</small>

			<form
				class="flex flex-col gap-2"
				on:submit|preventDefault={(sEvent) => loginWrapper('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter))}
			>
				<Input
					required
					class="border-black border-2 hidden required-mark"
					name="key"
					placeholder="Private key (nsec1...)"
					type="password"
					value={accointInfo.cSk}
				/>
				<Input required class="border-black border-2 required-mark" name="password" placeholder="Password" type="password" />
				<Button variant="primary" type="submit" disabled={isLoading}>Sign in</Button>
			</form>
			<div class="flex items-center space-x-2">
				<Checkbox id="terms" bind:checked aria-labelledby="terms-label" />
				<Label
					id="terms-label"
					for="terms"
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Remember me
				</Label>
			</div>
		</section>
	</Dialog.Content>
</Dialog.Root>
