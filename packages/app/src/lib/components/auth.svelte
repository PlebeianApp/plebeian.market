<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import { Checkbox } from '$lib/components/ui/checkbox/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Separator } from '$lib/components/ui/separator'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { login } from '$lib/ndkLogin'
	import { type BaseAccount } from '$lib/stores/session'
	import { generateSecretKey } from 'nostr-tools'
	import * as nip19 from 'nostr-tools/nip19'
	import { toast } from 'svelte-sonner'

	import Pattern from './Pattern.svelte'

	let checked = false
	let authDialogOpen = false
	let createDialogOpen = false
	let nsec: ReturnType<(typeof nip19)['nsecEncode']> | null = null

	async function loginWrapper(loginMethod: BaseAccount['type'], formData?: FormData, autoLogin?: boolean) {
		;(await login(loginMethod, formData, autoLogin)) ? toast.success('Login sucess!') : toast.error('Login error!')
	}

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'
</script>

<Dialog.Root bind:open={authDialogOpen}>
	<Dialog.Trigger class="flex items-center cursor-pointer gap-2 w-full">
		<span class="i-tdesign-user-1" />Log in
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
			<Tabs.List class="w-full justify-around bg-transparent">
				<Tabs.Trigger value="nip07" class={activeTab}>Extension</Tabs.Trigger>
				<Tabs.Trigger value="sk" class={activeTab}>Private Key</Tabs.Trigger>
				<Tabs.Trigger disabled value="nip46" class={activeTab}>Advanced</Tabs.Trigger>
				<Tabs.Trigger value="create" class={activeTab}>Sign up</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="nip07" class="flex flex-col gap-2">
				<Button
					on:click={() => loginWrapper('NIP07', undefined, checked)}
					variant="outline"
					class="w-full border-black border-2 font-bold flex items-center gap-1"
					><span class="text-black text-md">Sign in with extension</span>
					<span class="i-mdi-puzzle-outline text-black w-6 h-6"> </span></Button
				>
				<span
					>Recommended method. Use <a
						class="underline"
						href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp">nos2x</a
					>,
					<a class="underline" href="https://chromewebstore.google.com/detail/nostr-connect/ampjiinddmggbhpebhaegmjkbbeofoaj"
						>nostrconnect</a
					>,
					<a class="underline" href="https://getalby.com/">alby</a> or similar.</span
				>
			</Tabs.Content>
			<Tabs.Content value="sk" class="flex flex-col gap-2">
				<form
					class="flex flex-col gap-2"
					on:submit|preventDefault={(sEvent) => loginWrapper('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter), checked)}
				>
					<Input required class="border-black border-2" name="key" placeholder="Private key (nsec1...)" id="signInSk" type="password" />
					<Input required class="border-black border-2" name="password" placeholder="Password" id="signInPass" type="password" />
					<Button id="signInSubmit" type="submit">Sign in</Button>
				</form>
			</Tabs.Content>
			<Tabs.Content value="nip46" class="flex flex-col gap-2">
				<form
					class="flex flex-col gap-2"
					on:submit|preventDefault={(sEvent) => loginWrapper('NSEC', new FormData(sEvent.currentTarget, sEvent.submitter), checked)}
				>
					<Input required class="border-black border-2" name="key" placeholder="Private key (nsec1...)" id="signInSk" type="password" />
					<Input required class="border-black border-2" name="password" placeholder="Password" id="signInPass" type="password" />
					<Button id="signInSubmit" type="submit">Sign in</Button>
				</form>
			</Tabs.Content>
			<Tabs.Content value="create" class="flex flex-col gap-2">
				<span>
					We use nostr’s private/public key pair system to generate accounts (keys). They act as your username and password. <a
						href="/"
						class="underline">Learn more</a
					>.
				</span>
				<form
					class="flex flex-col gap-2"
					on:submit|preventDefault={async (sEvent) => {
						const key = generateSecretKey()
						nsec = nip19.nsecEncode(key)
						const formData = new FormData(sEvent.currentTarget, sEvent.submitter)
						formData.append('key', nsec)
						await loginWrapper('NSEC', formData)
						authDialogOpen = false
						createDialogOpen = true
					}}
				>
					<Input id="signUpPassword" required class="border-black border-2" name="password" placeholder="Password" type="password" />
					<Button id="signUpSubmit" type="submit" class="w-full">Generate an account</Button>
				</form>
			</Tabs.Content>
			<div class=" flex flex-col gap-2">
				<Separator />
				<div class="">
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
					Don’t have an account?
					<Tabs.Trigger value="create" class="underline cursor-pointer p-0">Sign up</Tabs.Trigger>
				</p>
			</div>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Save your account key</Dialog.Title>
			<Dialog.Description class="text-black">
				Here is your newly generated account key. It allows you to purchase anonymously, and is stored in your browser on this device only. <span
					class="font-bold">Be sure to save it, or you’ll lose access to your account</span
				>
			</Dialog.Description>
		</Dialog.Header>
		<Button variant="secondary" class="relative overflow-auto flex flex-row gap-2 bg-transparent">
			<code class="truncate w-3/4">{nsec}</code>
			<span class="i-tdesign-copy" style="width: 1rem; height: 1rem; color: black;"></span>
		</Button>
		<Button on:click={() => (createDialogOpen = false)} class="w-full font-bold">I understand, and I saved my key</Button>
	</Dialog.Content>
</Dialog.Root>
