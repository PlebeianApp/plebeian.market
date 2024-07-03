import type { ClassValue } from 'clsx'
import type { VerifiedEvent } from 'nostr-tools'
import type { TransitionConfig } from 'svelte/transition'
import { type NDKEvent, type NDKKind, type NDKTag, type NDKUserProfile, type NostrEvent } from '@nostr-dev-kit/ndk'
import ndkStore from '$lib/stores/ndk'
import { clsx } from 'clsx'
import { differenceInDays } from 'date-fns'
import { decode } from 'nostr-tools/nip19'
import { encrypt } from 'nostr-tools/nip49'
import { ofetch } from 'ofetch'
import { toast } from 'svelte-sonner'
import { cubicOut } from 'svelte/easing'
import { get } from 'svelte/store'
import { twMerge } from 'tailwind-merge'

import type { EventCoordinates } from './interfaces'
import { numSatsInBtc } from './constants'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

type FlyAndScaleParams = {
	y?: number
	x?: number
	start?: number
	duration?: number
}

export const flyAndScale = (node: Element, params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }): TransitionConfig => {
	const style = getComputedStyle(node)
	const transform = style.transform === 'none' ? '' : style.transform

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA
		const [minB, maxB] = scaleB

		const percentage = (valueA - minA) / (maxA - minA)
		const valueB = percentage * (maxB - minB) + minB

		return valueB
	}

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str
			return str + `${key}:${style[key]};`
		}, '')
	}

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t,
			})
		},
		easing: cubicOut,
	}
}

export async function currencyToBtc(currency: string, amount: number, inSats?: boolean): Promise<number | null> {
	try {
		const { result } = await ofetch(`https://api.yadio.io/convert/${amount}/${currency}/btc`)
		return inSats ? bitcoinToSatoshis(result) : result
	} catch (error) {
		console.error(`Error converting ${amount} ${currency} to BTC: ${error}`)
		return null
	}
}

export const bitcoinToSatoshis = (amountInBtc: string) => {
	const btc = parseFloat(amountInBtc)
	return Math.floor(btc * numSatsInBtc)
}

export function formatPrice(price: number): string {
	return Number(price.toFixed(2)).toString()
}

export function getEventCoordinates(event: NostrEvent | VerifiedEvent | NDKEvent): EventCoordinates {
	const { kind, pubkey, tags } = event

	const [_, tagD] = tags.find(([key]) => key === 'd') ?? []

	if (!event || !kind || kind < 30000 || kind >= 40000 || !pubkey || !tagD) {
		throw new Error(
			!kind
				? 'no kind?'
				: kind < 30000 || kind >= 40000
					? 'Invalid event kind, must be between 30000 and 40000'
					: !pubkey
						? 'Event object missing pubkey'
						: !tagD
							? 'Event object missing "d" tag'
							: 'Unknown error',
		)
	}

	return {
		coordinates: `${kind}:${pubkey}:${tagD}`,
		kind: kind,
		pubkey: pubkey,
		tagD: tagD,
	}
}

export function customTagValue(eventTags: NDKTag[], key: string, thirdValue?: string): string[] {
	const values = eventTags
		.filter(([k, v, t]) => k === key && (thirdValue === undefined || t === thirdValue))
		.map(([_, v, t]) => (thirdValue === undefined ? v : t))

	return values
}

export const slugify = (str: string) => {
	return decodeURIComponent(str)
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-*|-*$/g, '')
}

export function isPReplacEvent(n: number | NDKKind): boolean {
	return n >= 30000 && n < 40000
}

export const bytesToHex = (byteArray: Uint8Array) => {
	return Array.from(byteArray, function (byte) {
		return ('0' + (byte & 0xff).toString(16)).slice(-2)
	}).join('')
}

export async function fetchUserProfile(pk: string): Promise<NDKUserProfile | undefined> {
	try {
		if (typeof window !== 'undefined') {
			const ndk = get(ndkStore)
			const ndkUser = ndk.getUser({ pubkey: pk })

			await ndkUser.fetchProfile({
				closeOnEose: true,
				groupable: false,
				groupableDelay: 200,
			})
			return ndkUser.profile as NDKUserProfile
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
// Code extracted from https://github.com/paulmillr/noble-hashes/blob/b930aa959dfb95a936096b5ac79a3dcfbdab2332/src/utils.ts#L73
const asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 } as const
function asciiToBase16(char: number): number | undefined {
	if (char >= asciis._0 && char <= asciis._9) return char - asciis._0
	if (char >= asciis._A && char <= asciis._F) return char - (asciis._A - 10)
	if (char >= asciis._a && char <= asciis._f) return char - (asciis._a - 10)
	return
}

export function hexToBytes(hex: string): Uint8Array {
	if (typeof hex !== 'string') throw new Error('hex string expected, got ' + typeof hex)
	const hl = hex.length
	const al = hl / 2
	if (hl % 2) throw new Error('padded hex string expected, got unpadded hex of length ' + hl)
	const array = new Uint8Array(al)
	for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
		const n1 = asciiToBase16(hex.charCodeAt(hi))
		const n2 = asciiToBase16(hex.charCodeAt(hi + 1))
		if (n1 === undefined || n2 === undefined) {
			const char = hex[hi] + hex[hi + 1]
			throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi)
		}
		array[ai] = n1 * 16 + n2
	}
	return array
}

export function findCustomTags(tags: NDKTag[], tagName: string): string[] {
	return tags.filter(([name]) => name === tagName).map(([, ...values]) => values[0])
}

export async function copyToClipboard(data: BlobPart, mimeType = 'text/plain') {
	try {
		if (navigator.clipboard.write) {
			await navigator.clipboard.write([
				new ClipboardItem({
					[mimeType]: new Blob([data], {
						type: mimeType,
					}),
					['text/plain']: new Blob([data], {
						type: 'text/plain',
					}),
				}),
			])
		} else {
			await new Promise((resolve) => {
				resolve(navigator.clipboard.writeText(String(data)))
			})
		}
		toast.success('Copied 👍')
	} catch (e) {
		toast.success(`Error: ${e}`)
		console.log(e)
	}
}

export function nav_back() {
	if (typeof window !== 'undefined') window.history.back()
}

export function truncateString(str: string): string {
	return str.substring(0, 12) + ':' + str.substring(str.length - 6)
}

export const getElapsedTimeInDays = (unixTimestamp: number): number => {
	const now = new Date()
	const targetDate = new Date(unixTimestamp * 1000)

	const elapsedDays = differenceInDays(now, targetDate)

	return elapsedDays
}

export const decodePk = (pk: string | null | undefined) => {
	if (!pk) return null
	return pk.startsWith('npub') ? decode(pk).data.toString() : pk
}

export const createNcryptSec = (sk: string, pass: string): { decodedSk: Uint8Array; ncryptsec: string } => {
	const decoded = decode(sk)
	if (decoded.type !== 'nsec') throw new Error('Not nsec')
	const ncryptsec = encrypt(decoded.data, pass)
	return { decodedSk: decoded.data, ncryptsec }
}
