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
	import { toast } from 'svelte-sonner'

	import Pattern from './Pattern.svelte'

	let checked = false

	let dialogOpen = false
	async function loginWrapper(loginMethod: BaseAccount['type'], submitEvent?: SubmitEvent, autoLogin?: boolean) {
		;(await login(loginMethod, submitEvent, autoLogin)) ? toast.success('Login sucess!') : toast.error('Login error!')
		dialogOpen = false
	}
	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger class="flex items-center cursor-pointer gap-2">
		<Button class="p-2 bg-white"><span class="i-tdesign-view-list text-black w-6 h-6"></span></Button>
	</Dialog.Trigger>
	<Dialog.Content class="max-w-[425px] gap-0 p-0 text-black">
		<Dialog.Header class="relative w-full bg-black text-center text-white py-8 flex items-center">
			<Pattern />
			<div class="flex flex-row gap-2 items-center">
				<a href="/"><img src="/logo.svg" alt="logo" class="w-16" /></a>
				<span class="relative z-10 text-left text-lg font-bold text-primary">plebeian<br />market</span>
			</div>
		</Dialog.Header>
		<Tabs.Root value="join" class="p-4">
			<Tabs.List class="w-full justify-around bg-transparent">
				<Tabs.Trigger value="join" class={activeTab}>Sign in</Tabs.Trigger>
				<Tabs.Trigger value="create" class={activeTab}>Sign up</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="join" class="flex flex-col gap-2">
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
				<div class="w-full flex justify-center items-center gap-2 px-6">
					<Separator class="w-1/2" />
					<span> OR </span>
					<Separator class="w-1/2" />
				</div>
				<form class="flex flex-col gap-2" on:submit|preventDefault={(sEvent) => loginWrapper('NSEC', sEvent, checked)}>
					<Input class="border-black border-2" id="key" placeholder="Private key (nsec1...)" type="password" />
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
						Keep me logged in
					</Label>
				</div>
				<p class="w-full text-center">
					Don’t have an account?
					<Tabs.Trigger value="create" class="underline cursor-pointer p-0">Sign up</Tabs.Trigger>
				</p>
			</Tabs.Content>
			<Tabs.Content value="create" class="flex flex-col gap-2">
				<span>
					We use nostr’s private/public key pair system to generate accounts (keys). They act as your username and password. <a
						href="/"
						class="underline">Learn more</a
					>.
				</span>
				<Button type="submit">Generate an account</Button>
				<p class="w-full text-center">
					Already have an account?
					<Tabs.Trigger value="create" class="underline cursor-pointer p-0">Sign in</Tabs.Trigger>
				</p>
			</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>
