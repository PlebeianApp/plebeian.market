<script lang="ts">
	import { page } from '$app/stores'
	import { Button } from '$lib/components/ui/button'
	import { Checkbox } from '$lib/components/ui/checkbox'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import * as Tabs from '$lib/components/ui/tabs'
	import { login, loginWithNostrConnect } from '$lib/ndkLogin'
	import { dialogs } from '$lib/stores/dialog'
	import { type BaseAccount } from '$lib/stores/session'
	import { generateSecretKey } from 'nostr-tools'
	import { nsecEncode } from 'nostr-tools/nip19'
	import { toast } from 'svelte-sonner'

	import type { PageData } from '../../../routes/$types'
	import Spinner from '../assets/spinner.svelte'
	import Hero from '../common/hero.svelte'
	import Nip46Login from '../common/nip-46-login.svelte'
	import SaveKeyDialog from './saveKeyDialog.svelte'

	$: ({ appSettings } = $page.data as PageData)
	let tab: 'login-nip07' | 'signup' | 'login-nsec' = 'login-nip07'
	let checked = true
	let nsec: ReturnType<typeof nsecEncode> | null = null
	let loading = false

	async function handleLogin(loginMethod: BaseAccount['type'], formData?: FormData, autoLogin?: boolean) {
		loading = true
		const loginResult = await login(loginMethod, formData, autoLogin)

		if (loginResult) {
			toast.success('Login success!')
			if (loginMethod == 'NIP07' || !nsec) {
				dialogs.clearAll()
			}
		} else {
			toast.error('Login error!')
		}
		loading = false
	}

	function handleNostrConnectLogin(event: CustomEvent) {
		const { signer, bunkerUrl, localPrivateKey } = event.detail
		loginWithNostrConnect({ signer, bunkerUrl, localPrivateKey, autoLogin: checked })
		toast.success('Login success!')
		dialogs.clearAll()
	}

	async function handleSignUp(formData: FormData) {
		loading = true
		const key = generateSecretKey()
		nsec = nsecEncode(key)
		formData.append('key', nsec)
		await handleLogin('NSEC', formData, checked)
		dialogs.clearAll()
		dialogs.show(SaveKeyDialog, { nsec })
		loading = false
	}

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'
</script>

<div class="flex flex-col w-full">
	<Hero class="relative flex justify-center" py="8">
		<div class="flex flex-row gap-2 justify-center z-10">
			{#if loading}
				<Spinner size={60} color="white" />
			{:else}
				<img src={appSettings.logoUrl} alt="logo" class="w-16" />
			{/if}
		</div>
	</Hero>

	<div class="p-6">
		<Tabs.Root value={tab}>
			{#if tab !== 'signup'}
				<Tabs.List class="w-full justify-around bg-transparent mb-6">
					<Tabs.Trigger value="login-nip07" class={activeTab}>Extension</Tabs.Trigger>
					<Tabs.Trigger value="login-signer" class={activeTab}>N-Conenct</Tabs.Trigger>
					<Tabs.Trigger value="login-nsec" class={activeTab}>Private Key</Tabs.Trigger>
				</Tabs.List>
			{/if}

			<Tabs.Content value="login-nip07" class="flex flex-col gap-4">
				<Button
					on:click={() => handleLogin('NIP07', undefined, checked)}
					variant="focus"
					class="w-full flex items-center gap-1"
					disabled={!window.nostr}
				>
					<span class="i-mdi-puzzle-outline w-6 h-6" />
					<span class="text-lg">Extension Login</span>
				</Button>
				{#if !window.nostr}
					<p class="text-sm text-gray-500">
						Don’t have one? We recommend using <a
							class="underline"
							target="_blank"
							href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp">nos2x</a
						>
						to get started, other alternatives are
						<a
							class="underline"
							target="_blank"
							href="https://chromewebstore.google.com/detail/nostr-connect/ampjiinddmggbhpebhaegmjkbbeofoaj">nostrconnect</a
						>,
						<a class="underline" target="_blank" href="https://getalby.com/">alby</a> or similar.
					</p>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="login-nsec" class="flex flex-col gap-4">
				<p class="text-sm text-gray-500">
					Log in using an existing private key (nsec). For enhanced security, consider using a browser extension.
				</p>
				<form
					class="flex flex-col gap-4"
					on:submit|preventDefault={(sEvent) => handleLogin('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter), checked)}
				>
					<Input required class="border-black border-2" name="key" placeholder="Private key (nsec1...)" id="signInSk" type="password" />
					<Input required class="border-black border-2" name="password" placeholder="Password" id="signInPass" type="password" />
					<Button variant="primary" id="signInSubmit" type="submit">Log in</Button>
				</form>
			</Tabs.Content>

			<Tabs.Content value="login-signer" class="flex flex-col gap-4">
				<Nip46Login on:event={(e) => handleNostrConnectLogin(e)} />
			</Tabs.Content>

			<Tabs.Content value="signup" class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<span>
						Signing up creates a Nostr key pair. Save the private key securely for account recovery.
						<a href="https://nostr.how/en/get-started" target="_blank" class="underline">Learn more</a>.
					</span>
					<span>Your password protects your key pair.</span>
				</div>
				<form
					class="flex flex-col gap-4"
					on:submit|preventDefault={async (sEvent) => {
						handleSignUp(new FormData(sEvent.currentTarget, sEvent.submitter))
					}}
				>
					<Input id="signUpPassword" required class="border-black border-2" name="password" placeholder="Password" type="password" />
					<Button variant="primary" id="signUpSubmit" type="submit" class="w-full">Generate an account</Button>
				</form>
			</Tabs.Content>

			<div class="flex flex-col gap-4 items-center mt-6">
				<div class="flex items-center gap-2">
					<Checkbox id="terms" bind:checked aria-labelledby="terms-label" />
					<Label
						id="terms-label"
						for="terms"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Remember me
					</Label>
				</div>
				<div class=" bg-muted w-full flex flex-col justify-center text-center gap-1 p-2">
					<span class="text-sm text-gray-500">{tab !== 'signup' ? 'Don’t have a nostr account?' : 'Already have a nostr account?'}</span>
					<Button class="underline text-lg" variant="link" on:click={() => (tab = tab === 'signup' ? 'login-nip07' : 'signup')}
						>{tab === 'signup' ? 'Log in' : 'Sign up'}</Button
					>
				</div>
			</div>
		</Tabs.Root>
	</div>
</div>
