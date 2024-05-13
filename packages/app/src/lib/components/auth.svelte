<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Separator } from '$lib/components/ui/separator'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import { loginWithExtension, loginWithPrivateKey } from '$lib/ndkLogin'
	import { type BaseAccount } from '$lib/stores/session'
	import { toast } from 'svelte-sonner'

	import Pattern from './Pattern.svelte'

	let dialogOpen = false
	let isLoading: boolean = false
	let isInputFrom: boolean = false
	async function login(loginMethod: BaseAccount['type'], submitEvent?: SubmitEvent) {
		let result: boolean
		if (loginMethod == 'NIP07') {
			try {
				result = await loginWithExtension()
				dialogOpen = false
				result ? toast.success('Login sucess!') : toast.error('Login error!')
			} catch (e) {
				dialogOpen = false
				toast.error('Login error!')
				throw Error('No loging')
			}
		} else if (loginMethod == 'NSEC' && submitEvent) {
			const form = submitEvent.target as HTMLFormElement
			const keyInput = form.elements.namedItem('key') as HTMLInputElement
			const passwordInput = form.elements.namedItem('password') as HTMLInputElement
			try {
				result = await loginWithPrivateKey(keyInput.value, passwordInput.value)
				dialogOpen = false
				result ? toast.success('Login sucess!') : toast.error('Login error!')
			} catch (e) {
				dialogOpen = false
				toast.error('Login error!')
				throw Error('No loging')
			}
		}
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
				<Button on:click={() => login('NIP07')} variant="outline" class="w-full border-black border-2 font-bold flex items-center gap-1"
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
				<form class="flex flex-col gap-2" on:submit|preventDefault={(sEvent) => login('NSEC', sEvent)}>
					<Input
						class="border-black border-2"
						id="key"
						placeholder="Private key (nsec1...)"
						type="password"
						on:focus={() => (isInputFrom = true)}
					/>
					{#if isInputFrom}
						<Input class="border-black border-2" id="password" placeholder="Password" type="password" />
						<Button type="submit">Sign in</Button>
					{/if}
				</form>
				<p class="w-full text-center">
					Don’t have an account? <span class="underline cursor-pointer">Sign up</span>
				</p>
			</Tabs.Content>
			<Tabs.Content value="create">Sign up</Tabs.Content>
		</Tabs.Root>
	</Dialog.Content>
</Dialog.Root>
