<script lang="ts">
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
	import type { DisplayProduct } from '$lib/server/products.service'
	import type { RichStall } from '$lib/server/stalls.service'
	import type { Selected } from 'bits-ui'
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query'
	import { GETUserFromId, PUTUser } from '$lib/apiUtils'
	import CreateEditProduct from '$lib/components/product/create-edit.svelte'
	import DeleteAccount from '$lib/components/settings/delete-account.svelte'
	import CreateEditStall from '$lib/components/stalls/create-edit.svelte'
	import * as Alert from '$lib/components/ui/alert/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { Label } from '$lib/components/ui/label/index.js'
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select'
	import { Separator } from '$lib/components/ui/separator'
	import { Skeleton } from '$lib/components/ui/skeleton'
	import { Slider } from '$lib/components/ui/slider/index.js'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'
	import ndkStore, { defaulRelaysUrls } from '$lib/stores/ndk'

	import type { User } from '@plebeian/database'

	import type { PageData } from './$types'

	const queryClient = useQueryClient()

	export let data: PageData
	const { userTrustLevels } = data

	$: relayUrls = [...new Set([...($ndkStore.activeUser?.relayUrls ?? []), ...defaulRelaysUrls])].map((u) => new URL(u))

	let stallsMode: 'list' | 'create' | 'edit' = 'list'
	let productsMode: 'list' | 'create' | 'edit' = 'list'

	$: stallsQuery = createQuery<RichStall[]>({
		queryKey: ['stalls', stallsMode, !!$ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const filter = { userId: $ndkStore.activeUser.pubkey }
				const res = await fetch(new URL(`/api/v1/stalls?${new URLSearchParams(filter)}`, window.location.origin))
				return res.json()
			}
			return null
		},
	})

	$: productsQuery = createQuery<DisplayProduct[]>({
		queryKey: ['products', productsMode, !!$ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const filter = { userId: $ndkStore.activeUser.pubkey }
				const res = await fetch(new URL(`/api/v1/products?${new URLSearchParams(filter)}`, window.location.origin))
				return res.json()
			}
			return null
		},
	})

	let userTrustLevel: Selected<string> | undefined = undefined

	$: userQuery = createQuery<User>({
		queryKey: ['user', !!$ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = await GETUserFromId($ndkStore.activeUser.pubkey).then((res) => res.json())

				if (!userTrustLevel) {
					userTrustLevel = {
						value: user.trustLevel,
						label: user.trustLevel,
					}
				}

				return user
			}
			return null
		},
	})
	$: userData = $userQuery.data ?? {
		nip05: '',
		about: '',
		displayName: '',
		name: '',
		image: '',
		lud16: '',
	}

	const userDataMutation = createMutation({
		mutationFn: async () => {
			const ndkUser = $ndkStore.getUser({
				hexpubkey: $ndkStore.activeUser?.pubkey,
			})

			ndkUser.profile = {
				...userData,
				trustLevel: userTrustLevel?.value,
			} as NDKUserProfile

			if ($ndkStore.activeUser?.pubkey) {
				const res = await PUTUser(ndkUser).then((res) => res.json())
				await ndkUser.publish()
				return res
			}
			return null
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['user', !!$ndkStore.activeUser?.pubkey] })
			queryClient.setQueryData(['user', !!$ndkStore.activeUser?.pubkey], data)
		},
	})

	const handleUserDataSubmit = async () => {
		$userDataMutation.mutate()
	}

	let v4v = [50]

	let currentStall: RichStall | null = null
	let currentProduct: DisplayProduct | null = null
</script>

{#if $ndkStore.activeUser && $ndkStore.signer}
	<div class="px-4 py-20 lg:px-12 min-h-[100vh]">
		<div class="mx-auto w-full max-w-2xl flex flex-col gap-2">
			<h2>Settings</h2>

			<Separator />
			<Tabs.Root value="products" class="w-full flex items-start gap-6">
				<Tabs.List class="flex flex-col h-full bg-transparent items-start text-black">
					<Tabs.Trigger value="stalls" class="px-0 data-[state=active]:text-primary">My Stalls</Tabs.Trigger>
					<Tabs.Trigger value="products" class="px-0 data-[state=active]:text-primary">My Products</Tabs.Trigger>
					<Tabs.Trigger value="wallet" class="px-0 data-[state=active]:text-primary">Wallet</Tabs.Trigger>
					<Tabs.Trigger value="userSettings" class="px-0 data-[state=active]:text-primary">User settings</Tabs.Trigger>
					<Tabs.Trigger value="email" class="px-0 data-[state=active]:text-primary">Email</Tabs.Trigger>
					<Tabs.Trigger value="network" class="px-0 data-[state=active]:text-primary">Network</Tabs.Trigger>
					<Tabs.Trigger value="notifications" class="px-0 data-[state=active]:text-primary">Notifications</Tabs.Trigger>
					<Tabs.Trigger value="v4v" class="px-0 data-[state=active]:text-primary">Value for Value</Tabs.Trigger>
					<Tabs.Trigger value="deleteAccount" class="px-0 text-destructive data-[state=active]:text-destructive"
						>Delete account</Tabs.Trigger
					>
				</Tabs.List>
				<Tabs.Content value="stalls" class="flex flex-col w-full gap-6">
					{#if stallsMode === 'list'}
						<div class="flex justify-between items-center">
							<h3 class="text-xl">My Stalls</h3>
							<Button
								on:click={() => {
									stallsMode = 'create'
									currentStall = null
								}}
								variant="outline"
								class="border-2 border-black font-bold px-6">New</Button
							>
						</div>
					{:else if stallsMode === 'create' || stallsMode === 'edit'}
						<button class="w-fit" on:click={() => (stallsMode = 'list')}>
							<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
						</button>
					{/if}
					<div class="flex flex-col gap-2">
						{#if stallsMode === 'list'}
							{#if $stallsQuery.isLoading}
								<Skeleton class="h-12 w-full" />
								<Skeleton class="h-12 w-full" />
								<Skeleton class="h-12 w-full" />
							{/if}
							{#each [...($stallsQuery.data ?? [])] as stall}
								<Button
									on:click={() => {
										stallsMode = 'edit'
										currentStall = stall
									}}
									class="cursor-pointer border border-gray flex justify-start items-center p-4 font-bold"
									variant="outline"
								>
									<div class="flex items-center gap-2">
										<span class="i-tdesign-store w-6 h-6" />
										<span>{stall.name}</span>
									</div>
								</Button>
							{/each}
						{:else if stallsMode === 'create' || stallsMode === 'edit'}
							<CreateEditStall stall={currentStall} on:success={() => (stallsMode = 'list')} />
						{/if}
					</div>
				</Tabs.Content>

				<Tabs.Content value="products" class="flex flex-col w-full gap-6">
					{#if productsMode === 'list'}
						<div class="flex justify-between items-center">
							<h3 class="text-xl">My Products</h3>
							<Button
								on:click={() => {
									productsMode = 'create'
									currentProduct = null
								}}
								variant="outline"
								class="border-2 border-black font-bold px-6">New</Button
							>
						</div>
					{:else if productsMode === 'create' || productsMode === 'edit'}
						<button class="w-fit" on:click={() => (productsMode = 'list')}>
							<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
						</button>
					{/if}
					<div class="flex flex-col gap-2">
						{#if productsMode === 'list'}
							{#if $productsQuery.isLoading}
								<Skeleton class="h-12 w-full" />
								<Skeleton class="h-12 w-full" />
								<Skeleton class="h-12 w-full" />
							{/if}
							{#each [...($productsQuery.data ?? [])] as product}
								<Button
									on:click={() => {
										productsMode = 'edit'
										currentProduct = product
									}}
									class="cursor-pointer border border-gray flex justify-start items-center p-4 font-bold"
									variant="outline"
								>
									<div class="flex items-center gap-2">
										<span class="i-tdesign-store w-6 h-6" />
										<span>{product.name}</span>
									</div>
								</Button>
							{/each}
						{:else if productsMode === 'create' || productsMode === 'edit'}
							<CreateEditProduct product={currentProduct} on:success={() => (productsMode = 'list')} />
						{/if}
					</div>
				</Tabs.Content>

				<Tabs.Content value="wallet" class="flex flex-col w-full gap-6">
					<div class="flex justify-between items-center">
						<h3 class="text-xl">Wallet</h3>
					</div>

					<form class="flex flex-col gap-4">
						<div class="grid w-full items-center gap-1.5">
							<Label for="lud16" class="font-bold">Lightning Address</Label>
							<Input bind:value={userData.lud16} type="email" id="lud16" placeholder="e.g. username@walletofsatoshi.com" />
						</div>
						<div class="grid w-full items-center gap-1.5">
							<Label for="xpub" class="font-bold">XPUB / ZPUB</Label>
							<Input id="xpub" placeholder="" />
						</div>
						<div class="grid w-full items-center gap-1.5">
							<Label for="walletName" class="font-bold">Wallet Name (Optional)</Label>
							<Input id="walletName" placeholder="e.g. Shop Wallet" />
						</div>
						<Button class="w-full font-bold">Save</Button>
					</form>
				</Tabs.Content>

				<Tabs.Content value="userSettings" class="flex flex-col w-full gap-6">
					<div class="flex justify-between items-center">
						<h3 class="text-xl">User settings</h3>
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label for="userImage" class="font-bold">Profile image</Label>
						<Input bind:value={userData.image} type="image" id="userImage" src={userData.image} />
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label for="name" class="font-bold">Name</Label>
						<Input bind:value={userData.name} type="text" id="name" placeholder={userData.name} />
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label for="name" class="font-bold">Display Name</Label>
						<Input bind:value={userData.displayName} type="text" id="displayName" placeholder={userData.displayName} />
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label for="about" class="font-bold">Short bio</Label>
						<Textarea bind:value={userData.about} rows={8} id="about" placeholder={userData.about} />
					</div>

					<div class="grid w-full items-center gap-1.5">
						<Label for="nip05" class="font-bold">Nostr address</Label>
						<Input bind:value={userData.nip05} type="text" id="nip05" placeholder={userData.nip05} />
					</div>

					<div class="flex-grow">
						<Label class="truncate font-bold">Trust level</Label>
						<Select bind:selected={userTrustLevel} name="trustLevel">
							<SelectTrigger class="border-black border-2">
								<SelectValue placeholder={userTrustLevel?.label} />
							</SelectTrigger>
							<SelectContent class="border-black border-2 max-h-[350px] overflow-y-auto">
								{#each userTrustLevels as trustLevel}
									<SelectItem value={trustLevel}>{trustLevel}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<Button id="userDataSubmit" class="w-full font-bold" on:click={handleUserDataSubmit}>Save</Button>
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

				<Tabs.Content value="payments" class="flex flex-col w-full gap-6"></Tabs.Content>

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
				<Tabs.Content value="deleteAccount" class="flex flex-col w-full gap-6">
					<DeleteAccount userName={userData.name} />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
{:else}
	You must login
{/if}
