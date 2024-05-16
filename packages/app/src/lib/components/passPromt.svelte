<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { standardDisplayDateFormat } from '$lib/constants'
	import { login } from '$lib/ndkLogin'
	import { type BaseAccount, type NsecAccount } from '$lib/stores/session'
	import { fetchUserProfile } from '$lib/utils'
	import { format } from 'date-fns'
	import { npubEncode } from 'nostr-tools/nip19'
	import { toast } from 'svelte-sonner'

	import Pattern from './Pattern.svelte'
	import AvatarFallback from './ui/avatar/avatar-fallback.svelte'
	import AvatarImage from './ui/avatar/avatar-image.svelte'
	import Avatar from './ui/avatar/avatar.svelte'

	export let dialogOpen = false
	export let accointInfo: NsecAccount
	async function loginWrapper(loginMethod: BaseAccount['type'], submitEvent?: SubmitEvent) {
		;(await login(loginMethod, submitEvent)) ? toast.success('Login sucess!') : toast.error('Login error!')
		dialogOpen = false
	}
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
		<section class=" p-4">
			<span>Log with your last account</span>
			<div class=" inline-flex w-full items-center gap-2">
				{#await fetchUserProfile(accointInfo.hexPubKey)}
					<section>
						<span>{npubEncode(accointInfo.hexPubKey).substring(0, 16)}...</span>
					</section>
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
		</section>
	</Dialog.Content>
</Dialog.Root>
