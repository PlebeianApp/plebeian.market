<script lang="ts">
	import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
	import QrCode from '@castlenine/svelte-qrcode'
	import { NDKEvent, NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
	import { browser } from '$app/environment'
	import { Button } from '$lib/components/ui/button'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { defaultNostrConnectRelays } from '$lib/constants'
	import { createNostrConnectSub } from '$lib/nostrSubs/subs'
	import ndkStore from '$lib/stores/ndk'
	import { copyToClipboard } from '$lib/utils'
	import { ChevronDown } from 'lucide-svelte'
	import { createEventDispatcher, onMount } from 'svelte'
	import { get } from 'svelte/store'

	import Spinner from '../assets/spinner.svelte'
	import { Input } from '../ui/input'

	const dispatch = createEventDispatcher()

	let tempSecret = ''
	let localSigner: NDKPrivateKeySigner | null = null
	let localPubkey: string | null = null
	let generatingConnectionUrl = false
	let selectedRelay = ''
	let connectionUrl: string | null = null
	let eventStoreSub: NDKEventStore<ExtendedBaseType<NDKEvent>> | undefined

	$: {
		if (localPubkey) {
			connectionUrl = generateConnectionUrl(localPubkey, selectedRelay)

			eventStoreSub = createNostrConnectSub(localPubkey)

			eventStoreSub?.subscribe(async (event) => {
				if (!localSigner) return

				const nostrConnectEvent = event[0]

				if (!nostrConnectEvent) return

				await nostrConnectEvent.decrypt(undefined, localSigner)
				const response = JSON.parse(nostrConnectEvent.content)

				if (tempSecret !== response.result) return

				if (response.result && response.result === tempSecret) {
					const bunkerUrl = constructBunkerUrl(nostrConnectEvent)
					const ndk = get(ndkStore)
					const nip46Signer = new NDKNip46Signer(ndk, bunkerUrl, localSigner)
					dispatch('login', {
						signer: nip46Signer,
						bunkerUrl,
						localPrivateKey: localSigner.privateKey ?? '',
						autoLogin: true,
					})
					eventStoreSub?.unsubscribe()
				} else if (response.method && response.method === 'connect') {
					console.log('Connect method in response')
					return
				}
			})
		}
	}

	$: relays = defaultNostrConnectRelays
	$: if (relays.length > 0 && !selectedRelay) {
		selectedRelay = defaultNostrConnectRelays[0]
		$ndkStore.addExplicitRelay(selectedRelay)
	}

	onMount(async () => {
		if (!localSigner) {
			generatingConnectionUrl = true
			localSigner = NDKPrivateKeySigner.generate()
			const user = await localSigner.user()
			localPubkey = user.pubkey
			selectedRelay = relays[0] as string
			generatingConnectionUrl = false
		}
	})

	const constructBunkerUrl = (event: NDKEvent) => {
		const pTag = event.tags.find((tag) => tag[0] === 'p')
		if (!pTag?.[1]) throw new Error('No pubkey in p tag')

		const baseUrl = `bunker://${event.pubkey}?`

		const params = new URLSearchParams()
		params.set('relay', selectedRelay)
		params.set('secret', tempSecret ?? '')

		return baseUrl + params.toString()
	}

	const generateConnectionUrl = (pubkey: string | null, relay: string | null): string | null => {
		if (!pubkey || !browser || !relay) return null

		console.log('Generating connection URL for:', pubkey)

		const host = browser ? window.location.origin : ''
		const secret = Math.random().toString(36).substring(2, 15)
		tempSecret = secret

		const params = new URLSearchParams()
		params.set('relay', relay || '')
		params.set('name', 'Plebeian.market')
		params.set('url', host)
		params.set('secret', secret)

		return `nostrconnect://${pubkey}?${params.toString()}`
	}

	function selectRelay(relay: string) {
		selectedRelay = relay
	}

	function handleRelayInput(event: Event) {
		const input = event.target as HTMLInputElement
		const value = input.value.trim()

		relays = [...relays, value]

		if (value === '' || value.startsWith('wss://')) {
			selectedRelay = value
			if (value !== '' && !relays.includes(value)) {
				$ndkStore.addExplicitRelay(value)
			}
		}
	}

	function handleInputClick(e: Event) {
		e.stopPropagation()
	}
</script>

<div class="flex flex-col items-center gap-2">
	{#if generatingConnectionUrl}
		<div class="flex flex-col items-center gap-2 py-8">
			<span class="i-lucide-loader-2 w-8 h-8 animate-spin" />
			<p class="text-sm text-muted-foreground">Generating connection...</p>
		</div>
	{:else if connectionUrl}
		<p class="text-xs font-bold">Extension Click QR code to open signer app</p>
		<a href={connectionUrl} class="block hover:opacity-90 transition-opacity" target="_blank" rel="noopener noreferrer">
			{#key connectionUrl}
				<QrCode data={connectionUrl} size={330} />
			{/key}
		</a>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="border-2 border-black justify-between w-full" iconPosition="right" builders={[builder]}>
					{selectedRelay || 'Select a relay'}
					<ChevronDown slot="icon" class="h-4 w-4" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-full">
				<DropdownMenu.Label class="flex items-center gap-2">
					<span class="i-mdi-plus" style="width: 1rem; height: 1rem; color: black;" />
					<Input
						type="text"
						placeholder="Add a relay manually"
						class="border-0"
						on:input={handleRelayInput}
						on:click={handleInputClick}
					/></DropdownMenu.Label
				>
				<DropdownMenu.Separator />
				<section class="max-h-[350px] overflow-y-auto">
					{#each relays as relay}
						<DropdownMenu.CheckboxItem checked={selectedRelay === relay} on:click={() => selectRelay(relay)}>
							{relay}
						</DropdownMenu.CheckboxItem>
					{/each}
				</section>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<div class="flex items-center gap-2 w-full">
			<Input type="text" value={connectionUrl} readonly class="w-full" on:click={(e) => e.currentTarget.select()} />
			{#if !generatingConnectionUrl}
				<Spinner />
			{/if}
			<Button variant="ghost" size="icon" on:click={() => copyToClipboard(connectionUrl || '')}>
				<span class="i-tdesign-copy shrink-0" style="width: 1rem; height: 1rem; color: black;" />
			</Button>
		</div>
	{:else}
		<p class="text-red-500">Unable to generate connection URL</p>
	{/if}
</div>
