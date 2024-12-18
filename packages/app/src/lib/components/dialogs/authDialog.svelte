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

	<Tabs.Root value="nip07" class="p-4">
		<Tabs.List class="w-full justify-around bg-transparent">
			<Tabs.Trigger value="nip07" class={activeTab}>Extension</Tabs.Trigger>
			<Tabs.Trigger value="sk" class={activeTab}>Private Key</Tabs.Trigger>
			<Tabs.Trigger value="create" class={activeTab}>Sign up</Tabs.Trigger>
			<!-- <Tabs.Trigger disabled value="nip46" class={activeTab}>Advanced</Tabs.Trigger> -->
		</Tabs.List>

		<Tabs.Content value="nip07" class="flex flex-col gap-2">
			<Button
				on:click={() => handleLogin('NIP07', undefined, checked)}
				variant="focus"
				class="w-full border-black border-2 font-bold flex items-center gap-1"
				disabled={!window.nostr}
			>
				<span class="text-black text-md">Sign in with extension</span>
				<span class="i-mdi-puzzle-outline text-black w-6 h-6"> </span>
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
		</Tabs.Content>

		<Tabs.Content value="sk" class="flex flex-col gap-2">
			<span> Sign in using an existing private key (nsec). </span>
			<p class="font-bold">For enhanced security, consider using a browser extension.</p>
			<form
				class="flex flex-col gap-2"
				on:submit|preventDefault={(sEvent) => handleLogin('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter), checked)}
			>
				<Input required class="border-black border-2" name="key" placeholder="Private key (nsec1...)" id="signInSk" type="password" />
				<Input required class="border-black border-2" name="password" placeholder="Password" id="signInPass" type="password" />
				<Button variant="primary" id="signInSubmit" type="submit">Sign in</Button>
			</form>
		</Tabs.Content>

		<Tabs.Content value="nip46" class="flex flex-col gap-2">
			<form
				class="flex flex-col gap-2"
				on:submit|preventDefault={(sEvent) => handleLogin('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter), checked)}
			>
				<Input required class="border-black border-2" name="key" placeholder="Private key (nsec1...)" id="remoteSignIn" type="password" />
				<Input required class="border-black border-2" name="password" placeholder="Password" id="remoteSignInPass" type="password" />
				<Button variant="primary" id="remoteSignInSubmit" type="submit">Sign in</Button>
			</form>
		</Tabs.Content>

		<Tabs.Content value="create" class="flex flex-col gap-2">
			<span>
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

		<div class="flex flex-col gap-2 items-center">
			<Separator />
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
			<p class="text-center">
				Don't have an account?
				<Tabs.Trigger value="create" class="underline cursor-pointer p-0">Sign up</Tabs.Trigger>
			</p>
			<p class="text-center">
				<a href="https://nostr.how/en/get-started" class="underline">Learn more about nostr</a>
			</p>
		</div>
	</Tabs.Root>
</Dialog.Content>
