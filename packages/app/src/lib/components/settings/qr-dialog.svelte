<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import * as Dialog from '$lib/components/ui/dialog'
	import { nwcUriToWalletDetails } from '$lib/utils'
	import { Html5Qrcode } from 'html5-qrcode'
	import { createEventDispatcher } from 'svelte'
	import { toast } from 'svelte-sonner'
	import { z } from 'zod'

	let dialogOpen = false
	let qrCodeData = ''
	let html5QrCode: Html5Qrcode

	const dispatch = createEventDispatcher()

	const ncwWalletSchema = z.object({
		walletPubKey: z.string(),
		walletRelays: z.array(z.string()),
		walletSecret: z.string(),
	})

	function openDialog() {
		dialogOpen = true
	}

	function closeDialog() {
		dialogOpen = false
	}
	function startScanner() {
		const config = { fps: 10, qrbox: { width: 300, height: 300 } }

		html5QrCode = new Html5Qrcode('reader')
		html5QrCode.start(
			{ facingMode: 'environment' },
			config,
			(decodedText: string) => {
				qrCodeData = decodedText
				html5QrCode.stop()

				const walletDetails = nwcUriToWalletDetails(qrCodeData)
				try {
					const parsedData = ncwWalletSchema.safeParse(walletDetails)

					if (!parsedData.success) {
						toast.error('Invalid QR CODE')
						throw new Error('Invalid QR code data')
					}
					dispatch('validQrScanned', parsedData.data)
					toast.success('Wallet added successfully')
					closeDialog()
				} catch (error) {
					console.error('Invalid QR code data:', error)
				}
			},
			(errorMessage: string) => {},
		)
	}

	$: if (dialogOpen) {
		setTimeout(startScanner, 0)
	}
</script>

<Button on:click={openDialog} size="icon" variant="ghost" class="text-destructive border-0">
	<span class="i-mingcute-qrcode-line text-black w-6 h-6"></span>
</Button>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="max-w-[66vw]">
		<Dialog.Header>
			<Dialog.Title>Scan QR Code from your NWC Wallet</Dialog.Title>
			<Dialog.Description>Point your camera at a QR code to scan it.</Dialog.Description>
		</Dialog.Header>

		<div id="reader" class="w-full h-"></div>

		<Dialog.Footer>
			<Button on:click={closeDialog}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
