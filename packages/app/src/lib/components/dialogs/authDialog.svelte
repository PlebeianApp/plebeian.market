<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { Checkbox } from '$lib/components/ui/checkbox'
	import * as Dialog from '$lib/components/ui/dialog'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import { Separator } from '$lib/components/ui/separator'
	import * as Tabs from '$lib/components/ui/tabs'
	import { login } from '$lib/ndkLogin'
	import { dialogs } from '$lib/stores/dialog'
	import { type BaseAccount } from '$lib/stores/session'
	import { generateSecretKey } from 'nostr-tools'
	import { nsecEncode } from 'nostr-tools/nip19'
	import { toast } from 'svelte-sonner'

	import Spinner from '../assets/spinner.svelte'
	import Pattern from '../Pattern.svelte'
	import SaveKeyDialog from './saveKeyDialog.svelte'

	let tab: 'login' | 'signup' = 'login'
	let checked = false
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

<Dialog.Content class="gap-0 p-0 text-black">
	<Dialog.Header class="relative w-full bg-black text-center text-white py-8 flex items-center">
		<Pattern />
		<div class="flex flex-row gap-2 items-center">
			{#if loading}
				<Spinner size={60} />
			{:else}
				<img src="/logo.svg" alt="logo" class="w-16" />
			{/if}
		</div>
	</Dialog.Header>

	<Tabs.Root value={tab} class="p-4">
		<Tabs.Content value="login" class="flex flex-col gap-2">
			<Button
				on:click={() => handleLogin('NIP07', undefined, checked)}
				variant="focus"
				class="w-full border-black border-2 flex items-center gap-1"
				disabled={!window.nostr}
			>
				<span class="i-mdi-puzzle-outline text-black w-6 h-6"> </span>
				<span class="text-lg">Extension Login</span>
			</Button>
			{#if !window.nostr}
				<span>
					It appears that you don't have an extension installed. You may want to consider using one of the recommended methods.
					<a class="underline" href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp">nos2x</a>,
					<a class="underline" href="https://chromewebstore.google.com/detail/nostr-connect/ampjiinddmggbhpebhaegmjkbbeofoaj"
						>nostrconnect</a
					>,
					<a class="underline" href="https://getalby.com/">alby</a> or similar.
				</span>
			{/if}

			<p class="text-sm text-gray-500">
				Sign in using an existing private key (nsec).
				For enhanced security, consider using a browser extension.

			</p>
			<form
				class="flex flex-col gap-2"
				on:submit|preventDefault={(sEvent) => handleLogin('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter), checked)}
			>
				<Input required class="border-black border-2" name="key" placeholder="Private key (nsec1...)" id="signInSk" type="password" />
				<Input required class="border-black border-2" name="password" placeholder="Password" id="signInPass" type="password" />
				<Button variant="primary" id="signInSubmit" type="submit">Log in</Button>
			</form>
		</Tabs.Content>


		<Tabs.Content value="signup" class="flex flex-col gap-2">
			<span class="text-sm text-gray-500">
				After signing up, we'll generate a unique Nostr keypair, which serves as your username and password. Your private key will be
				displayed - please save it securely to ensure account recovery.
				<a href="https://nostr.how/en/get-started" class="underline">Learn more</a>.
			</span>
			<form
				class="flex flex-col gap-2"
				on:submit|preventDefault={async (sEvent) => {
					handleSignUp(new FormData(sEvent.currentTarget, sEvent.submitter))
				}}
			>
				<Input id="signUpPassword" required class="border-black border-2" name="password" placeholder="Password" type="password" />
				<Button variant="primary" id="signUpSubmit" type="submit" class="w-full">Generate an account</Button>
			</form>
		</Tabs.Content>

		<div class="flex flex-col gap-2 items-center mt-4">
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

			<Button class="underline text-lg" variant="link" on:click={() => tab = tab === 'signup' ? 'login' : 'signup'}>{tab === 'signup' ? 'Sign in' : 'Sign up'}</Button>
		</div>
	</Tabs.Root>
</Dialog.Content>
