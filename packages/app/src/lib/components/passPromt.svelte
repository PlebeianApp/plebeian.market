<script lang="ts">
	import { browser } from '$app/environment'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Skeleton } from '$lib/components/ui/skeleton/index.js'
	import { standardDisplayDateFormat } from '$lib/constants'
	import { login } from '$lib/ndkLogin'
	import { type BaseAccount, type NsecAccount } from '$lib/stores/session'
	import { fetchUserProfile } from '$lib/utils'
	import { format } from 'date-fns'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'

	import Pattern from './Pattern.svelte'
	import AvatarFallback from './ui/avatar/avatar-fallback.svelte'
	import AvatarImage from './ui/avatar/avatar-image.svelte'
	import Avatar from './ui/avatar/avatar.svelte'
	import Checkbox from './ui/checkbox/checkbox.svelte'
	import Label from './ui/label/label.svelte'

	export let dialogOpen = false
	export let accointInfo: NsecAccount

	let checked: boolean

	async function loginWrapper(loginMethod: BaseAccount['type'], submitEvent?: SubmitEvent) {
		;(await login(loginMethod, submitEvent)) ? toast.success('Login sucess!') : toast.error('Login error!')
		dialogOpen = false
	}

	$: {
		if (browser && checked != undefined) {
			localStorage.setItem('auto_login', `${checked}`)
		}
	}

	onMount(() => {
		if (localStorage.getItem('auto_login') == 'true') {
			checked = true
		} else {
			checked = false
		}
	})
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="max-w-[425px] gap-0 p-0 text-black">
		<Dialog.Header class="relative w-full bg-black text-center text-white py-8 flex items-center">
			<Pattern />
			<div class="flex flex-row gap-2 items-center">
				<a href="/"><img src="/logo.svg" alt="logo" class="w-16" /></a>
				<span class="relative z-10 text-left text-lg font-bold text-primary">plebeian<br />market</span>
			</div>
		</Dialog.Header>
		<section class="p-4 flex flex-col gap-2">
			<span>Log with your last account</span>
			<div class=" inline-flex w-full items-center gap-2">
				{#await fetchUserProfile(accointInfo.hexPubKey)}
					<div class="flex items-center space-x-4">
						<Skeleton class="h-12 w-12 rounded-full" />
						<div class="space-y-2">
							<Skeleton class="h-4 w-[250px]" />
							<Skeleton class="h-4 w-[200px]" />
						</div>
					</div>
				{:then value}
					<Avatar>
						<AvatarImage src={value?.image} alt="pfp" />
						<AvatarFallback>{value?.name ?? value?.displayName ?? ''}</AvatarFallback>
					</Avatar>
					<section class="flex flex-col">
						<span class="font-bold">{value?.name ?? value?.displayName ?? ''}</span>
						<span>{npubEncode(accointInfo.hexPubKey).substring(0, 16)}...</span>
					</section>
				{/await}
			</div>
			<small>Last logged: {format(accointInfo.lastLogged, standardDisplayDateFormat)}</small>

			<form class="flex flex-col gap-2" on:submit|preventDefault={(sEvent) => loginWrapper('NSEC', sEvent)}>
				<Input class="hidden" id="key" placeholder="Private key (nsec1...)" type="text" value={accointInfo.cSk} />
				<Input class="border-black border-2" id="password" placeholder="Password" type="password" />
				<Button type="submit">Sign in</Button>
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
