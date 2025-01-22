<script lang="ts">
	import { NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
	import ndkStore from '$lib/stores/ndk'
	import { Html5Qrcode } from 'html5-qrcode'
	import { Camera } from 'lucide-svelte'
	import { createEventDispatcher, onDestroy } from 'svelte'
	import { toast } from 'svelte-sonner'
	import { get } from 'svelte/store'

	import { Input } from '../ui/input'

	const dispatch = createEventDispatcher()

	let cameraOpen = false
	let html5QrCode: Html5Qrcode | null = null

	let bunkerUrl = ''

	async function stopScanner() {
		if (html5QrCode) {
			try {
				await html5QrCode.stop()
				html5QrCode = null
			} catch (error) {
				console.error('Error stopping scanner:', error)
			}
		}
		cameraOpen = false
	}

	function startScanner() {
		cameraOpen = true

		html5QrCode = new Html5Qrcode('reader')

		html5QrCode
			.start(
				{ facingMode: 'environment' },
				{
					fps: 10,
					qrbox: 250,
				},
				(decodedText: string) => {
					stopScanner()
					handleScannedQR(decodedText)
					toast.success('QR Code scanned successfully')
				},
				(errorMessage: string) => {
					if (!errorMessage.includes('No element')) {
						console.info('QR Scan error:', errorMessage)
					}
				},
			)
			.catch((err) => {
				console.error('Failed to start scanner:', err)
				toast.error('Failed to start camera')
				cameraOpen = false
			})
	}

	async function handleScannedQR(qrData: string) {
		try {
			const url = new URL(qrData)
			if (url.protocol !== 'bunker:') {
				toast.error('Invalid QR code: Not a bunker URL')
				return
			}
			bunkerUrl = qrData

			const ndk = get(ndkStore)

			if (!ndk) {
				toast.error('No NDK instance found')
				return
			}

			const localSigner = (await ndk.signer) as NDKPrivateKeySigner
			const nip46Signer = new NDKNip46Signer(ndk, bunkerUrl, localSigner)

			dispatch('login', {
				signer: nip46Signer,
				bunkerUrl,
				localPrivateKey: localSigner?.privateKey ?? '',
			})
		} catch (error) {
			toast.error('Invalid QR code format')
			console.error('Error parsing QR data:', error)
		}
	}

	$: if (cameraOpen) {
		startScanner()
	}

	onDestroy(() => {
		stopScanner()
	})
</script>

<div class="flex flex-col gap-4 items-center">
	<button type="button" class="w-full h-[300px]" on:click={() => (cameraOpen = true)}>
		<div id="reader" class={`w-full h-full flex flex-col items-center justify-center ${cameraOpen ? '' : 'bg-lighter-black'}`}>
			{#if !cameraOpen}
				<Camera class="text-white h-8 w-8" />
				<span class="text-white">Scan QR Code</span>
			{/if}
		</div>
	</button>

	<p class="text-xs font-bold">Extension Click QR code to open signer app</p>
	<Input
		type="text"
		value={bunkerUrl}
		class="w-full"
		on:click={(e) => e.currentTarget.select()}
		on:input={(e) => handleScannedQR(e.currentTarget.value)}
		placeholder="bunker://<pubkey>?relay=wss://relay.example.com&secret=<secret>"
	/>
</div>
