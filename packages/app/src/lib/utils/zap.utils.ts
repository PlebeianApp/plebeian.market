import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk'
import { Invoice } from '@getalby/lightning-tools'
import { NDKKind } from '@nostr-dev-kit/ndk'
import { queryClient } from '$lib/fetch/client'
import ndkStore from '$lib/stores/ndk'
import { payInvoiceWithNWC, updateBalanceOfWorkingNWCs } from '$lib/stores/nwc'
import { differenceInSeconds, intervalToDuration } from 'date-fns'
import { get } from 'svelte/store'

export const LN_ADDRESS_REGEX =
	/^((?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*)|(?:".+"))@((?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const EMAIL_REGEX =
	/^((?:[^<>()[$$\\.,;:\s@"]+(?:\.[^<>()[$$\\.,;:\s@"]+)*)|(?:".+"))@((?:$$[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$$)|(?:(?:[a-zA-Z\-_0-9]+\.)+[a-zA-Z]{2,}))$/

export function createInvoiceObject(bolt11String: string): Invoice {
	return new Invoice({ pr: bolt11String })
}

export function setupZapSubscription(onZapEvent: (event: NDKEvent) => void): NDKSubscription {
	const ndk = get(ndkStore)
	const subscription = ndk.subscribe({
		kinds: [NDKKind.Zap],
		since: Math.round(Date.now() / 1000),
	})

	subscription.on('event', onZapEvent)
	return subscription
}

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

export function setupExpiryCountdown(expiryDate: Date, onTick: (secondsLeft: number) => void, onExpiry: () => void): () => void {
	const interval = setInterval(() => {
		const now = new Date()
		const secondsLeft = differenceInSeconds(expiryDate, now)

		if (secondsLeft <= 0) {
			onExpiry()
			clearInterval(interval)
		} else {
			onTick(secondsLeft)
		}
	}, 1000)

	return () => clearInterval(interval)
}

export function formatTime(totalSeconds: number | null): string {
	if (totalSeconds === null) return '--:--'

	const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 })
	const { days, hours, minutes, seconds } = duration

	if (days && days > 0) {
		return `${days}d ${hours}h ${minutes}m`
	} else if (hours && hours > 0) {
		return `${hours}h ${minutes}m ${seconds}s`
	} else {
		return `${minutes}:${seconds?.toString().padStart(2, '0')}`
	}
}

type PaymentResult = {
	success: boolean
	preimage?: string
	error?: string
}

export async function handleNWCPayment(
	invoice: Invoice,
	onSuccess: (preimage: string) => void,
	onError: (error: string) => void,
): Promise<PaymentResult> {
	try {
		const paidInvoice = await payInvoiceWithNWC(invoice.paymentRequest, invoice.satoshi)
		if (!paidInvoice.error && paidInvoice.result?.preimage) {
			onSuccess(paidInvoice.result.preimage)
			await queryClient.resetQueries({ queryKey: ['wallet-balance'] })
			updateBalanceOfWorkingNWCs()
			return { success: true, preimage: paidInvoice.result.preimage }
		} else {
			throw new Error(`${paidInvoice.error}` || 'Unknown error')
		}
	} catch (error) {
		console.error('NWC payment error:', error)
		const errorMessage = error instanceof Error ? error.message : 'NWC payment failed'
		onError(errorMessage)
		return { success: false, error: errorMessage }
	}
}

export async function handleWebLNPayment(
	invoice: Invoice,
	onSuccess: (preimage: string) => void,
	onError: (error: string) => void,
): Promise<PaymentResult> {
	try {
		await window.webln.enable()
		const response = await window.webln.sendPayment(invoice.paymentRequest)
		const paid = await invoice.validatePreimage(response.preimage)
		if (paid) {
			onSuccess(response.preimage)
			return { success: true, preimage: response.preimage }
		} else {
			throw new Error('Payment validation failed')
		}
	} catch (error) {
		console.error('WebLN payment error:', error)
		const errorMessage = error instanceof Error ? error.message : 'WebLN payment failed'
		onError(errorMessage)
		return { success: false, error: errorMessage }
	}
}
