<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Separator } from '$lib/components/ui/separator'
	import { Slider } from '$lib/components/ui/slider/index.js'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import ndkStore, { defaulRelaysUrls, ndk, ndkActiveUser } from '$lib/stores/ndk'

	$: relayUrls = [...new Set([...(ndk.activeUser?.relayUrls ?? []), ...defaulRelaysUrls])].map((u) => new URL(u))

	let v4v = [50]
</script>

{#if $ndkActiveUser && $ndkStore.signer}
	<div class="px-4 py-20 lg:px-12 min-h-[100vh]">
		<div class="mx-auto w-full max-w-2xl flex flex-col gap-2">
			<h2>Settings</h2>

			<Separator />
			<Tabs.Root value="stalls" class="w-full flex items-start gap-6">
				<Tabs.List class="flex flex-col h-full bg-transparent items-start text-black">
					<Tabs.Trigger value="stalls" class="px-0 data-[state=active]:text-primary">My Stalls</Tabs.Trigger>
					<Tabs.Trigger value="wallet" class="px-0 data-[state=active]:text-primary">Wallet</Tabs.Trigger>
					<Tabs.Trigger value="email" class="px-0 data-[state=active]:text-primary">Email</Tabs.Trigger>
					<Tabs.Trigger value="network" class="px-0 data-[state=active]:text-primary">Network</Tabs.Trigger>
					<Tabs.Trigger value="v4v" class="px-0 data-[state=active]:text-primary">Value for Value</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="stalls" class="flex flex-col w-full gap-6">
					<div class="flex justify-between items-center">
						<h3 class="text-xl">My Stalls</h3>
						<Button variant="outline" class="border-2 border-black font-bold px-6">New</Button>
					</div>
					<div class="flex flex-col">
						<div class="cursor-pointer border border-gray flex items-center p-4 font-bold">
							<div class="flex items-center gap-2">
								<span class="i-tdesign-store w-6 h-6" />
								<span>Stall 1</span>
							</div>
						</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="wallet" class="flex flex-col w-full gap-6">
					<div class="flex justify-between items-center">
						<h3 class="text-xl">Wallet</h3>
					</div>

					<form class="flex flex-col gap-4">
						<div class="grid w-full items-center gap-1.5">
							<Label for="email" class="font-bold">Lightning Address</Label>
							<Input type="email" id="email" placeholder="e.g. username@walletofsatoshi.com" />
						</div>
						<div class="grid w-full items-center gap-1.5">
							<Label for="email" class="font-bold">XPUB / ZPUB</Label>
							<Input type="email" id="email" placeholder="" />
						</div>
						<div class="grid w-full items-center gap-1.5">
							<Label for="email" class="font-bold">Wallet Name (Optional)</Label>
							<Input type="email" id="email" placeholder="e.g. Shop Wallet" />
						</div>
						<Button class="w-full font-bold">Save</Button>
					</form>
				</Tabs.Content>
				<Tabs.Content value="email" class="flex flex-col w-full gap-6">
					<div class="flex justify-between items-center">
						<h3 class="text-xl">Email</h3>
					</div>
					<Alert.Root class="bg-[var(--neo-blue)]">
						<Alert.Description
							>All sales inquiries will go into your direct message inbox automatically. The email address helps ensure you don’t miss
							anything, just in case.</Alert.Description
						>
					</Alert.Root>

					<form class="flex flex-col gap-4">
						<div class="grid w-full items-center gap-1.5">
							<Label for="email" class="font-bold">Email Address</Label>
							<Input type="email" id="email" placeholder="e.g. username@walletofsatoshi.com" />
						</div>
						<Button class="w-full font-bold">Save</Button>
					</form>
				</Tabs.Content>

				<Tabs.Content value="network" class="flex flex-col w-full gap-6">
					<div class="flex justify-between items-center">
						<h3 class="text-xl">Network</h3>
					</div>
					<Alert.Root class="bg-[var(--neo-blue)]">
						<Alert.Description
							>Your products are published to these relays (servers). You cannot modify this setting for now. Please let us know if you’d
							like to add a relay.</Alert.Description
						>
					</Alert.Root>

					<h4 class="text-lg font-bold">Relays</h4>
					<ul class="flex flex-col gap-2">
						{#each relayUrls as url}
							<li class="flex flex-col">
								<a href={url.href} class="font-bold text-md">{url.hostname}</a>
								<code class="text-sm">{url.href}</code>
							</li>
						{/each}
					</ul>
				</Tabs.Content>

				<Tabs.Content value="v4v" class="flex flex-col w-full gap-6">
					<div class="flex justify-between items-center">
						<h3 class="text-xl">Value for value</h3>
					</div>
					<Alert.Root class="bg-[var(--neo-blue)]">
						<Alert.Description
							>Plebeian Market is powered by your generosity. Your contribution is the only thing that enables us to continue creating free
							and open source solutions 🙏🙇‍♂️
						</Alert.Description>
					</Alert.Root>

					<Label class="font-bold">Value for value contribution (%{v4v[0]})</Label>
					<Slider bind:value={v4v} max={100} step={1} />
					<div class="text-center my-4">
						<span class="p-4 text-4xl rounded-full bg-[var(--neo-gray)]"> 🤙 </span>
					</div>

					<Button class="w-full font-bold">Save</Button>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
{:else}
	You must login
{/if}
