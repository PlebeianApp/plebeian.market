import { HDKey } from '@scure/bip32'
import { address as baddress, networks, payments } from 'bitcoinjs-lib'
import * as bs58check from 'bs58check'
import { NIP05_REGEX } from 'nostr-tools/nip05'

import { PAYMENT_DETAILS_METHOD } from '@plebeian/database/constants'

export type PaymentDetailsResult = {
	success: boolean
	paymentDetails?: string
	method?: (typeof PAYMENT_DETAILS_METHOD)[keyof typeof PAYMENT_DETAILS_METHOD]
	error?: string
}

const XPUB_PREFIX = new Uint8Array([0x04, 0x88, 0xb2, 0x1e])

export function checkExtendedPublicKey(input: string): boolean {
	try {
		bs58check.default.decode(input)
		return true
	} catch (e) {
		e instanceof Error && console.log(e.message)
		return false
	}
}

export function checkAddress(address: string): boolean {
	try {
		const data = baddress.fromBech32(address)
		return !!data
	} catch (e) {
		e instanceof Error && console.log(e.message)
		return false
	}
}

export function zpubToXpub(zpub: string): string | undefined {
	const data: Uint8Array = bs58check.default.decode(zpub)
	if (!data) return
	const xpubData = new Uint8Array(XPUB_PREFIX.length + data.slice(4).length)
	xpubData.set(XPUB_PREFIX)
	xpubData.set(data.slice(4), XPUB_PREFIX.length)
	return bs58check.default.encode(xpubData)
}

export function deriveAddresses(extendedKey: string, numAddressesToGenerate: number = 10, fromIndex: number = 0): string[] | null {
	const xpub = extendedKey.startsWith('zpub') ? zpubToXpub(extendedKey) : extendedKey

	if (!xpub || (!xpub.startsWith('xpub') && !isExtendedPublicKey(xpub)) || (xpub.startsWith('xpub') && !checkExtendedPublicKey(xpub))) {
		return null
	}

	const hdkey = HDKey.fromExtendedKey(xpub)

	return Array.from({ length: numAddressesToGenerate }, (_, i) => i + fromIndex)
		.map((i) => hdkey.derive(`m/0/${i}`))
		.map((child) => child.publicKey)
		.map((publicKey) => payments.p2wpkh({ pubkey: publicKey ?? undefined, network: networks.bitcoin }).address!)
}

export function isExtendedPublicKey(input: string): boolean {
	const result = input.startsWith('xpub') || input.startsWith('zpub')
	return result
}

export async function parsePaymentDetailsFromClipboard(): Promise<PaymentDetailsResult> {
	try {
		const text = await navigator.clipboard.readText()

		if (text.includes('@') && NIP05_REGEX.test(text)) {
			return {
				success: true,
				paymentDetails: text,
				method: PAYMENT_DETAILS_METHOD.LIGHTNING_NETWORK,
			}
		}

		if (text.startsWith('bc1') || text.startsWith('xpub') || text.startsWith('zpub')) {
			return {
				success: true,
				paymentDetails: text,
				method: PAYMENT_DETAILS_METHOD.ON_CHAIN,
			}
		}

		return {
			success: false,
			error: 'Unsupported payment details format',
		}
	} catch (error) {
		console.error('Failed to read clipboard:', error)
		return {
			success: false,
			error: 'Failed to read clipboard',
		}
	}
}
