import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk'
import type NDKSvelte from '@nostr-dev-kit/ndk-svelte'
import { Invoice, LightningAddress } from '@getalby/lightning-tools'
import { NDKKind, NDKRelay } from '@nostr-dev-kit/ndk'
import { queryClient } from '$lib/fetch/client'
import ndkStore, { GenericKeySigner } from '$lib/stores/ndk'
import { payInvoiceWithNWC, updateBalanceOfWorkingNWCs } from '$lib/stores/nwc'
import { differenceInSeconds, intervalToDuration } from 'date-fns'
import { get } from 'svelte/store'

type PaymentResult = {
	success: boolean
	preimage?: string
	error?: string
}

type LightningInvoiceResult = {
	invoice: Invoice
	allowsNostr: boolean
	lightningAddress: LightningAddress
}

type PaymentCheckingOptions = {
	isGetalby?: boolean
	onManualVerificationNeeded?: () => void
}

export const ZAP_RELAYS = [
	'wss://relay.damus.io',
	'wss://relay.nostr.band',
	'wss://nos.lol',
	'wss://relay.nostr.net',
	'wss://relay.minibits.cash',
	'wss://relay.coinos.io/',
]

export const LN_ADDRESS_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function createZapEventHandler(invoice: Invoice, onSuccess: (preimage: string) => void) {
	return (event: NDKEvent) => {
		const bolt11Tag = event.tagValue('bolt11')
		if (bolt11Tag && bolt11Tag === invoice.paymentRequest) {
			onSuccess(event.tagValue('preimage') || 'No preimage present')
		}
	}
}

export function handleZapEvent(event: NDKEvent, invoice: Invoice, onSuccess: () => void): void {
	if (event.tagValue('bolt11') === invoice?.paymentRequest) {
		onSuccess()
	}
}

export function createInvoiceObject(bolt11String: string): Invoice {
	return new Invoice({ pr: bolt11String })
}

export async function generateLightningInvoice(
	lightningAddress: string,
	amount: number,
	message: string,
	options?: {
		ndk?: NDKSvelte
		isAnonymous?: boolean
	},
): Promise<LightningInvoiceResult> {
	if (!LN_ADDRESS_REGEX.test(lightningAddress)) {
		throw new Error('Invalid lightning address')
	}

	const ln = new LightningAddress(lightningAddress)
	await ln.fetch()

	const allowsNostr = ln.lnurlpData?.allowsNostr ?? false
	let invoice: Invoice

	if (allowsNostr) {
		const nostrSigner = new GenericKeySigner({
			ndk: options?.ndk,
			isAnonymous: options?.isAnonymous,
		})

		invoice = await ln.zapInvoice(
			{
				satoshi: amount,
				relays: ZAP_RELAYS,
				comment: message,
			},
			{ nostr: nostrSigner },
		)
	} else {
		invoice = await ln.requestInvoice({
			satoshi: amount,
			comment: message,
		})
	}

	return { invoice, allowsNostr, lightningAddress: ln }
}

export async function handleWebLNPayment(
	invoice: Invoice,
	onSuccess: (preimage: string) => void,
	onError: (error: string) => void,
): Promise<PaymentResult | undefined> {
	if (!('webln' in window)) return undefined

	try {
		await window.webln.enable()
		const { preimage } = await window.webln.sendPayment(invoice.paymentRequest)

		if (invoice.validatePreimage(preimage)) {
			onSuccess(preimage)
			return { success: true, preimage }
		}
		throw new Error('Payment validation failed')
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'WebLN payment failed'
		onError(errorMessage)
		return { success: false, error: errorMessage }
	}
}

export async function handleNWCPayment(
	invoice: Invoice,
	onSuccess: (preimage: string) => void,
	onError: (error: string) => void,
): Promise<PaymentResult> {
	try {
		const paidInvoice = await payInvoiceWithNWC(invoice.paymentRequest, invoice.satoshi)

		if (paidInvoice.result?.preimage) {
			onSuccess(paidInvoice.result.preimage)
			await queryClient.resetQueries({ queryKey: ['wallet-balance'] })
			updateBalanceOfWorkingNWCs()
			return { success: true, preimage: paidInvoice.result.preimage }
		}

		throw new Error(paidInvoice.error?.message ?? 'Unknown error')
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'NWC payment failed'
		onError(errorMessage)
		return { success: false, error: errorMessage }
	}
}

export function addZapRelaysToNDKPool(ndkInstance: NDKSvelte): void {
	ZAP_RELAYS.forEach((url) => {
		const relay = new NDKRelay(url, undefined, ndkInstance)
		ndkInstance.pool.addRelay(relay, true)
	})
}

export function setupZapSubscription(onZapEvent: (event: NDKEvent) => void): NDKSubscription {
	const ndk = get(ndkStore)
	const subscription = ndk.subscribe({
		kinds: [NDKKind.Zap],
		since: Math.floor(Date.now() / 1000),
	})

	subscription.on('event', onZapEvent)
	return subscription
}

export function startPaymentChecking(
	invoice: Invoice,
	onSuccess: (preimage: string) => void,
	options: PaymentCheckingOptions = {},
): () => void {
	const cleanupFunctions: Array<() => void> = []

	if (options.isGetalby) {
		const interval = setInterval(async () => {
			try {
				const paid = await invoice?.isPaid()
				if (paid && invoice?.preimage) onSuccess(invoice.preimage)
			} catch (error) {
				console.error('Error checking payment:', error)
			}
		}, 750)
		cleanupFunctions.push(() => clearInterval(interval))
	} else {
		const zapEventHandler = (event: NDKEvent) => {
			const bolt11Tag = event.tagValue('bolt11')
			if (bolt11Tag === invoice.paymentRequest) {
				onSuccess(event.tagValue('preimage') || 'No preimage present')
			}
		}
		const subscription = setupZapSubscription(zapEventHandler)
		cleanupFunctions.push(() => subscription.stop())
	}

	if (options.onManualVerificationNeeded) {
		const timeout = setTimeout(options.onManualVerificationNeeded, 15000)
		cleanupFunctions.push(() => clearTimeout(timeout))
	}

	return () => cleanupFunctions.forEach((fn) => fn())
}

export function formatTime(totalSeconds: number | null): string {
	if (totalSeconds === null) return '--:--'

	const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 })
	const { days, hours, minutes, seconds } = duration

	if (days && days > 0) {
		return `${days}d ${hours}h ${minutes}m`
	}
	if (hours && hours > 0) {
		return `${hours}h ${minutes}m ${seconds}s`
	}
	return `${minutes}:${seconds?.toString().padStart(2, '0')}`
}

export function setupExpiryCountdown(expiryDate: Date, onTick: (secondsLeft: number) => void, onExpiry: () => void): () => void {
	const interval = setInterval(() => {
		const secondsLeft = differenceInSeconds(expiryDate, new Date())

		if (secondsLeft <= 0) {
			clearInterval(interval)
			onExpiry()
		} else {
			onTick(secondsLeft)
		}
	}, 1000)

	return () => clearInterval(interval)
}
