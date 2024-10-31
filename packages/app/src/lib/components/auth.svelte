<script lang="ts">
	import { NDKKind } from '@nostr-dev-kit/ndk'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Checkbox } from '$lib/components/ui/checkbox/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Separator } from '$lib/components/ui/separator'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { isSuccessfulLogin, login } from '$lib/ndkLogin'
	import { dmKind04Sub } from '$lib/nostrSubs/subs'
	import ndkStore from '$lib/stores/ndk'
	import { type BaseAccount } from '$lib/stores/session'
	import { copyToClipboard } from '$lib/utils'
	import { generateSecretKey } from 'nostr-tools'
	import { nsecEncode } from 'nostr-tools/nip19'
	import { toast } from 'svelte-sonner'

	import Pattern from './Pattern.svelte'

	let checked = false

	let dialogState = {
		auth: false,
		create: false,
	}

	let nsec: ReturnType<typeof nsecEncode> | null = null

	async function handleLogin(loginMethod: BaseAccount['type'], formData?: FormData, autoLogin?: boolean) {
		const loginResult = await login(loginMethod, formData, autoLogin)

		if (loginResult) {
			toast.success('Login success!')
			setupDMSubscription()
			if (loginMethod == 'NIP07' || dialogState.create == false) {
				isSuccessfulLogin.set(true)
			}
		} else {
			toast.error('Login error!')
		}
	}

	async function handleSignUp(formData: FormData) {
		const key = generateSecretKey()
		nsec = nsecEncode(key)
		formData.append('key', nsec)
		dialogState.create = true
		await handleLogin('NSEC', formData)
	}

	async function handlePrivKeyConfirmation() {
		isSuccessfulLogin.set(true)
		dialogState.create = false
	}

	function setupDMSubscription() {
		if (!$ndkStore.activeUser) return

		dmKind04Sub.changeFilters([
			{ kinds: [NDKKind.EncryptedDirectMessage], limit: 50, '#p': [$ndkStore.activeUser.pubkey] },
			{ kinds: [NDKKind.EncryptedDirectMessage], limit: 50, authors: [$ndkStore.activeUser.pubkey] },
		])
		dmKind04Sub.ref()
	}

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'
</script>

{#if !$ndkStore.activeUser}
	<Dialog.Root bind:open={dialogState.auth}>
		<Dialog.Trigger class="flex items-center cursor-pointer gap-2 w-full">
			<Button><span class="i-tdesign-user-1" />Log in</Button>
		</Dialog.Trigger>
		<Dialog.Content class="max-w-[425px] gap-0 p-0 text-black">
			<Dialog.Header class="relative w-full bg-black text-center text-white py-8 flex items-center">
				<Pattern />
				<div class="flex flex-row gap-2 items-center">
					<a href="/"><img src="/logo.svg" alt="logo" class="w-16" /></a>
					<span class="relative z-10 text-left text-lg font-bold text-primary">plebeian<br />market</span>
				</div>
			</Dialog.Header>
			<Tabs.Root value="nip07" class="p-4">
				<!-- Tab list content unchanged -->
				<Tabs.List class="w-full justify-around bg-transparent">
					<Tabs.Trigger value="nip07" class={activeTab}>Extension</Tabs.Trigger>
					<Tabs.Trigger value="sk" class={activeTab}>Private Key</Tabs.Trigger>
					<Tabs.Trigger disabled value="nip46" class={activeTab}>Advanced</Tabs.Trigger>
					<Tabs.Trigger value="create" class={activeTab}>Sign up</Tabs.Trigger>
				</Tabs.List>

				<!-- Tab content sections unchanged -->
				<Tabs.Content value="nip07" class="flex flex-col gap-2">
					<Button
						on:click={() => handleLogin('NIP07', undefined, checked)}
						variant="outline"
						class="w-full border-black border-2 font-bold flex items-center gap-1"
					>
						<span class="text-black text-md">Sign in with extension</span>
						<span class="i-mdi-puzzle-outline text-black w-6 h-6"> </span>
					</Button>
					<span>
						Recommended method. Use
						<a class="underline" href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp">nos2x</a>,
						<a class="underline" href="https://chromewebstore.google.com/detail/nostr-connect/ampjiinddmggbhpebhaegmjkbbeofoaj"
							>nostrconnect</a
						>,
						<a class="underline" href="https://getalby.com/">alby</a> or similar.
					</span>
				</Tabs.Content>

				<Tabs.Content value="sk" class="flex flex-col gap-2">
					<form
						class="flex flex-col gap-2"
						on:submit|preventDefault={(sEvent) => handleLogin('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter), checked)}
					>
						<Input required class="border-black border-2" name="key" placeholder="Private key (nsec1...)" id="signInSk" type="password" />
						<Input required class="border-black border-2" name="password" placeholder="Password" id="signInPass" type="password" />
						<Button id="signInSubmit" type="submit">Sign in</Button>
					</form>
				</Tabs.Content>

				<Tabs.Content value="nip46" class="flex flex-col gap-2">
					<form
						class="flex flex-col gap-2"
						on:submit|preventDefault={(sEvent) => handleLogin('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter), checked)}
					>
						<Input
							required
							class="border-black border-2"
							name="key"
							placeholder="Private key (nsec1...)"
							id="remoteSignIn"
							type="password"
						/>
						<Input required class="border-black border-2" name="password" placeholder="Password" id="remoteSignInPass" type="password" />
						<Button id="remoteSignInSubmit" type="submit">Sign in</Button>
					</form>
				</Tabs.Content>

				<Tabs.Content value="create" class="flex flex-col gap-2">
					<span>
						We use nostr's private/public key pair system to generate accounts (keys). They act as your username and password.
						<a href="/" class="underline">Learn more</a>.
					</span>
					<form
						class="flex flex-col gap-2"
						on:submit|preventDefault={async (sEvent) => {
							handleSignUp(new FormData(sEvent.currentTarget, sEvent.submitter))
						}}
					>
						<Input id="signUpPassword" required class="border-black border-2" name="password" placeholder="Password" type="password" />
						<Button id="signUpSubmit" type="submit" class="w-full">Generate an account</Button>
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
				</div>
			</Tabs.Root>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<Dialog.Root bind:open={dialogState.create}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Save your account key</Dialog.Title>
			<Dialog.Description class="text-black">
				Here is your newly generated account key. It allows you to purchase anonymously, and is stored in your browser on this device only.
				<span class="font-bold">Be sure to save it, or you'll lose access to your account</span>
			</Dialog.Description>
		</Dialog.Header>
		<Button variant="secondary" class="relative overflow-auto flex flex-row gap-2 bg-transparent" on:click={() => copyToClipboard(nsec)}>
			<code class="truncate w-3/4">{nsec}</code>
			<span class="i-tdesign-copy" style="width: 1rem; height: 1rem; color: black;"></span>
		</Button>
		<Button on:click={handlePrivKeyConfirmation} class="w-full font-bold">I understand, and I saved my key</Button>
	</Dialog.Content>
</Dialog.Root>
