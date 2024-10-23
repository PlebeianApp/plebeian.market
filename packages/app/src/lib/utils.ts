import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { ClassValue } from 'clsx'
import type { VerifiedEvent } from 'nostr-tools'
import type { Readable } from 'svelte/store'
import type { TransitionConfig } from 'svelte/transition'
import {
	type NDKEvent,
	type NDKKind,
	type NDKSigner,
	type NDKTag,
	type NDKUserProfile,
	type NDKZapMethodInfo,
	type NostrEvent,
} from '@nostr-dev-kit/ndk'
import { page } from '$app/stores'
import ndkStore from '$lib/stores/ndk'
import { clsx } from 'clsx'
import { differenceInDays } from 'date-fns'
import { decode } from 'nostr-tools/nip19'
import { encrypt } from 'nostr-tools/nip49'
import { ofetch } from 'ofetch'
import { toast } from 'svelte-sonner'
import { cubicOut } from 'svelte/easing'
import { derived, get } from 'svelte/store'
import { twMerge } from 'tailwind-merge'

import type { EventCoordinates } from './interfaces'
import type { NWCWallet } from './server/wallet.service'
import { HEX_KEYS_REGEX, numSatsInBtc } from './constants'
import { createProductExistsQuery } from './fetch/products.queries'
import { createStallExistsQuery } from './fetch/stalls.queries'
import { createUserExistsQuery } from './fetch/users.queries'

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

export async function btcToCurrency(currency: string): Promise<number | null> {
	try {
		const { result } = await ofetch(`https://api.yadio.io/convert/1/btc/${currency}`)
		return result
	} catch (error) {
		console.error(`Error converting BTC to ${currency}: ${error}`)
		return null
	}
}

export const bitcoinToSatoshis = (amountInBtc: number) => {
	return Math.floor(amountInBtc * numSatsInBtc)
}

export const satoshisToBtc = (amountInSatoshis: number): string => {
	const btcValue = amountInSatoshis / numSatsInBtc
	return btcValue.toFixed(8)
}

export function formatPrice(price: number): string {
	return Number(price.toFixed(2)).toString()
}

export function decimalToPercentage(value: number): number {
	return Number((value * 100).toPrecision(2))
}

export function parseCoordinatesString(input: string): Partial<EventCoordinates> {
	const parts = input.split(':')
	const result: Partial<EventCoordinates> = {
		tagD: input,
	}

	if (parts.length >= 3) {
		let tagDIndex = parts.length - 1
		while (tagDIndex >= 0 && !parts[tagDIndex]) {
			tagDIndex--
		}
		if (tagDIndex >= 0) {
			result.tagD = parts[tagDIndex]
		}

		for (let i = 0; i < tagDIndex; i++) {
			const part = parts[i]
			if (!result.kind) {
				const kindNumber = Number(part)
				if (!isNaN(kindNumber) && kindNumber >= 30000 && kindNumber < 40000) {
					result.kind = kindNumber
					continue
				}
			}
			if (!result.pubkey && HEX_KEYS_REGEX.test(part)) {
				result.pubkey = part
			}
		}

		if (result.kind && result.pubkey && result.tagD) {
			result.coordinates = `${result.kind}:${result.pubkey}:${result.tagD}`
		}
	}

	return result
}

export function getEventCoordinates(event: NostrEvent | VerifiedEvent | NDKEvent): EventCoordinates | null {
	const { kind, pubkey, tags } = event

	const dTag = tags.find(([key]) => key === 'd')
	const tagD = dTag?.[1]

	if (!kind || kind < 30000 || kind >= 40000 || !pubkey || !tagD) {
		console.warn(
			!kind
				? 'No kind found in event'
				: kind < 30000 || kind >= 40000
					? 'Invalid event kind, must be between 30000 and 40000'
					: !pubkey
						? 'Event object missing pubkey'
						: !tagD
							? 'Event object missing "d" tag'
							: 'Unknown error in getEventCoordinates',
		)
		console.warn('Event id:', event.id, 'Event pubkey', event.pubkey)
		return null
	}

	const coordinatesString = `${kind}:${pubkey}:${tagD}`
	const parsedCoordinates = parseCoordinatesString(coordinatesString)

	if (parsedCoordinates.coordinates && parsedCoordinates.tagD) {
		return {
			coordinates: parsedCoordinates.coordinates,
			kind,
			pubkey,
			tagD: parsedCoordinates.tagD,
		}
	}

	return null
}

export function customTagValue(eventTags: NDKTag[], key: string, thirdValue?: string): string[] {
	const values = eventTags
		.filter(([k, v, t]) => k === key && (thirdValue === undefined || t === thirdValue))
		.map(([_, v, t]) => (thirdValue === undefined ? v : t))

	return values
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
		toast.error(`Error: ${e}`)
		console.log(e)
	}
}

export function nav_back() {
	if (typeof window !== 'undefined') window.history.back()
}

export function truncateString(str: string, maxLenght: number = 18): string {
	if (str.length > maxLenght) return str.substring(0, 12) + ':' + str.substring(str.length - 6)
	return str
}

export function truncateText(str: string, maxLenght: number = 180): string {
	if (str.length > maxLenght) return str.substring(0, maxLenght) + '...'
	return str
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

export function stringToHexColor(input: string): string {
	let hash = 0
	for (let i = 0; i < input.length; i++) {
		hash = input.charCodeAt(i) + ((hash << 5) - hash)
	}

	let color = '#'
	for (let i = 0; i < 3; i++) {
		const value = (hash >> (i * 8)) & 0xff
		color += ('00' + value.toString(16)).substr(-2)
	}

	return color
}

export function getHexColorFingerprintFromHexPubkey(input: string): string {
	const hexpub = input.startsWith('npub') ? decodePk(input) : input
	return `#${hexpub.slice(0, 6)}`
}

export async function resolveQuery<T>(queryFn: () => CreateQueryResult<T, Error>, timeout: number = 1000 * 60): Promise<T> {
	const startTime = Date.now()
	const query = queryFn()
	let currentQuery = get(query)

	while (!currentQuery.isSuccess && !currentQuery.isError) {
		if (Date.now() - startTime > timeout) {
			throw new Error('Query timed out')
		}
		await new Promise((resolve) => setTimeout(resolve, 500))
		currentQuery = get(query)
	}

	if (currentQuery.isFetched && !currentQuery.isError) {
		return currentQuery.data
	}

	throw currentQuery.error || new Error('Price query failed')
}

export async function checkIfUserExists(userId?: string): Promise<boolean> {
	if (userId) return await resolveQuery(() => createUserExistsQuery(userId))
	return false
}

export async function checkIfStallExists(stallId?: string): Promise<boolean> {
	if (stallId) return await resolveQuery(() => createStallExistsQuery(stallId))
	return false
}

export async function checkIfProductExists(productId?: string): Promise<boolean> {
	if (productId) return await resolveQuery(() => createProductExistsQuery(productId))
	return false
}

export async function shouldRegister(allowRegister?: boolean, userExists?: boolean, userId?: string): Promise<boolean> {
	if (allowRegister == undefined) allowRegister = get(page).data.appSettings.allowRegister
	if (allowRegister || userExists) {
		return true
	}
	return userId ? await checkIfUserExists(userId) : false
}

export function unixTimeNow() {
	return Math.floor(new Date().getTime() / 1000)
}

export const calculateGeohashAccuracy = (boundingbox: [number, number, number, number]): number => {
	const [minLat, maxLat, minLon, maxLon] = boundingbox.map(Number)
	const latDiff = maxLat - minLat
	const lonDiff = maxLon - minLon
	const maxDiff = Math.max(latDiff, lonDiff)

	if (maxDiff < 0.0001) return 9 // ~5m
	if (maxDiff < 0.001) return 8 // ~40m
	if (maxDiff < 0.01) return 7 // ~150m
	if (maxDiff < 0.1) return 6 // ~1km
	if (maxDiff < 1) return 5 // ~5km
	return 4 // ~20km
}

export const debounce = (func: (...args: unknown[]) => void, delay: number) => {
	let timeoutId: ReturnType<typeof setTimeout>
	return (...args: unknown[]) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => func(...args), delay)
	}
}

export interface Location {
	place_id: string
	display_name: string
	lat: string
	lon: string
	boundingbox: [number, number, number, number]
}

export const searchLocation = async (query: string): Promise<Location[]> => {
	if (query.length < 3) return []
	const response = await ofetch<{ response: Location[] }>(
		`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
		{ parseResponse: JSON.parse },
	)
	if (!response || !Array.isArray(response)) return []
	console.log(response[0])
	return response.map(
		(item: Location): Location => ({
			place_id: item.place_id,
			display_name: item.display_name,
			lat: item.lat,
			lon: item.lon,
			boundingbox: item.boundingbox,
		}),
	)
}

export function mergeWithExisting<T>(existing: T[], newItems: T[], key: keyof T) {
	const existingSet = new Set(existing.map((item) => item[key]))
	return [...existing, ...newItems.filter((item) => !existingSet.has(item[key]))]
}

export function createChangeTracker<T extends Record<string, unknown>>(initialValues: T) {
	const stringify = (obj: Record<string, unknown>): string => JSON.stringify(obj, (_, v) => (typeof v === 'function' ? v.toString() : v))
	const initialString = stringify(initialValues)
	return (currentValues: Partial<T>): boolean => stringify({ ...initialValues, ...currentValues }) !== initialString
}

export const walletDetailsToNWCUri = (walletDetails: NWCWallet): string => {
	const baseUri = `nostr+walletconnect://${walletDetails.walletPubKey}`

	const relayParams = walletDetails.walletRelays.map((relay) => `relay=${encodeURIComponent(relay)}`).join('&')

	const secretParam = `secret=${walletDetails.walletSecret}`

	return `${baseUri}?${relayParams}&${secretParam}`
}

export function nwcUriToWalletDetails(uri: string): NWCWallet | null {
	try {
		const url = new URL(uri)

		if (url.protocol !== 'nostr+walletconnect:') throw new Error('Invalid protocol')

		const walletPubKey = url.pathname.slice(2) || url.host
		if (!HEX_KEYS_REGEX.test(walletPubKey)) throw new Error('Invalid public key' + walletPubKey)

		const walletRelays = url.searchParams.getAll('relay')
		if (walletRelays.length === 0) throw new Error('Missing relay parameter')

		const walletSecret = url.searchParams.get('secret')
		if (!walletSecret) throw new Error('Missing secret parameter')
		return { walletPubKey, walletRelays, walletSecret }
	} catch (error) {
		console.log(error)
		toast.error('Failed to parse NWC URI:' + error)
		return null
	}
}

export async function checkTargetUserHasLightningAddress(userIdToZap: string): Promise<NDKZapMethodInfo[]> {
	const user = get(ndkStore).getUser({ pubkey: userIdToZap })
	try {
		return await user.getZapInfo()
	} catch (error) {
		console.error('Failed to get zap info:', error)
		return []
	}
}

export class EncryptedStorage {
	signer: NDKSigner

	constructor(signer: NDKSigner) {
		this.signer = signer
	}

	async setItem(key: string, value: string): Promise<void> {
		key = await this.deriveKey(key)
		value = await this.signer.encrypt(await this.signer.user(), value)

		localStorage.setItem(key, value)
	}

	async getItem(key: string): Promise<string | null> {
		key = await this.deriveKey(key)
		const value = localStorage.getItem(key)
		if (value) {
			return this.signer.decrypt(await this.signer.user(), value)
		}

		return null
	}

	private async deriveKey(key: string) {
		const { pubkey } = await this.signer.user()
		return `${key}:${pubkey}`
	}
}

export function formatSats(amount: number): string
export function formatSats(amount: number, toDisplay: false): number
export function formatSats(amount: number, toDisplay?: boolean): string | number {
	const formattedAmount =
		toDisplay === undefined || toDisplay ? amount.toLocaleString(undefined, { maximumFractionDigits: 0 }) : Math.round(amount)
	return formattedAmount
}

export function reactiveDebounce<T>(value: Readable<T>, delayMs = 300) {
	let timer: ReturnType<typeof setTimeout> | null = null
	return derived(
		value,
		($value, set) => {
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => {
				set($value)
				timer = null
			}, delayMs)
		},
		get(value),
	)
}

export function getInvoiceStatusColor(status: string): string {
	switch (status) {
		case 'paid':
			return 'text-green-600'
		case 'pending':
			return 'text-yellow-600'
		default:
			return 'text-gray-600'
	}
}
