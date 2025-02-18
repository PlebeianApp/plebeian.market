import { toASCII } from 'punycode'
import { error } from '@sveltejs/kit'
import { getUserIdByNip05 } from '$lib/server/users.service'
import ndkStore from '$lib/stores/ndk'
import { decodePk } from '$lib/utils'
import { isValidHexKey, isValidNip05, isValidNpub } from '$lib/utils/validation.utils'
import { get } from 'svelte/store'

export interface URLComponents {
	userId: string
	identifier?: string
	kind?: number
}

export interface URLProcessorOptions {
	requireIdentifier?: boolean
	allowedFormats?: Array<'nip05' | 'npub' | 'hex'>
	kind?: number
	fallbackToNostr?: boolean
}

const DEFAULT_OPTIONS: Partial<URLProcessorOptions> = {
	fallbackToNostr: true,
	allowedFormats: ['nip05', 'npub', 'hex'],
}

interface CacheEntry {
	userId: string
	timestamp: number
}

export class URLProcessor {
	private static nip05Cache: Map<string, CacheEntry> = new Map()
	private static CACHE_TTL = 60 * 60 * 1000

	private static async processNip05(nip05: string): Promise<string> {
		const lowerNip05 = nip05.toLowerCase()

		const cachedEntry = this.nip05Cache.get(lowerNip05)
		if (cachedEntry && Date.now() - cachedEntry.timestamp < this.CACHE_TTL) {
			return cachedEntry.userId
		}

		const [name, domain] = lowerNip05.split('@')

		let punycodeDomain = domain

		if (!/^[a-z0-9.-]+$/.test(domain)) {
			try {
				punycodeDomain = toASCII(domain)
				console.log(`Punycode domain: ${punycodeDomain}`)
			} catch (err) {
				console.warn(`Punycode conversion failed for domain: ${domain}. Using original domain. Error: ${err}`)
				punycodeDomain = domain
			}
		}

		const punycodeNip05 = `${name}@${punycodeDomain}`

		try {
			let userId = await getUserIdByNip05(lowerNip05)

			if (!userId) {
				try {
					const userNostrRes = await get(ndkStore).getUserFromNip05(punycodeNip05, false)
					userId = userNostrRes?.pubkey ?? ''
				} catch (err) {
					console.error('Error fetching user from Nostr:', err)
					throw error(404, `Invalid NIP05 address: ${nip05}. Error fetching from Nostr.`)
				}
			}

			if (!userId) {
				throw error(404, `NIP05 address not found: ${nip05}`)
			}

			this.nip05Cache.set(lowerNip05, { userId, timestamp: Date.now() })

			return userId
		} catch (err) {
			console.error('Error processing NIP05:', err)
			throw error(400, `Invalid NIP05 address: ${nip05}. Error: ${err}`)
		}
	}
	private static processNpub(npub: string): string {
		try {
			return decodePk(npub)
		} catch (err) {
			console.error('Error decoding Npub:', err)
			throw error(400, `Invalid Npub: ${npub}. Error: ${err}`)
		}
	}

	private static validateHexKey(hex: string): string {
		if (!isValidHexKey(hex)) {
			throw error(400, `Invalid hex key: ${hex}`)
		}
		return hex
	}

	private static isNumeric(value: string): boolean {
		return /^\d+$/.test(value)
	}

	private static parseCoordinate(coordinate: string): { kind?: number; userId: string; identifier?: string } {
		const parts = coordinate.split(':')

		if (parts.length === 2) {
			return { userId: parts[0], identifier: parts[1] }
		}

		if (parts.length === 3) {
			const [kindStr, userId, identifier] = parts
			if (!this.isNumeric(kindStr)) {
				throw error(400, 'Invalid kind in coordinate')
			}
			return { kind: parseInt(kindStr), userId, identifier }
		}

		throw error(400, 'Invalid coordinate format')
	}

	static async processUserIdentifier(userIdentifier: string, options?: URLProcessorOptions): Promise<string> {
		const { allowedFormats = DEFAULT_OPTIONS.allowedFormats } = options ?? {}

		if (allowedFormats?.includes('nip05') && isValidNip05(userIdentifier)) {
			return this.processNip05(userIdentifier)
		}

		if (allowedFormats?.includes('npub') && isValidNpub(userIdentifier)) {
			return this.processNpub(userIdentifier)
		}

		if (allowedFormats?.includes('hex') && isValidHexKey(userIdentifier)) {
			return this.validateHexKey(userIdentifier)
		}

		throw error(400, `Invalid user identifier format: ${userIdentifier}`)
	}

	static buildCoordinateId({ kind, userId, identifier }: URLComponents): string {
		if (!kind) throw error(400, 'Kind is required to build coordinate ID')
		return `${kind}:${userId}${identifier ? `:${identifier}` : ''}`
	}

	static async parseURL(urlPath: string, options?: URLProcessorOptions): Promise<URLComponents> {
		if (!urlPath) throw error(400, 'URL path is required')
		const decodedUrlPath = decodeURIComponent(urlPath)

		const parts = decodedUrlPath.split('/').filter(Boolean)
		if (parts.length === 0 || parts.length > 2) throw error(400, 'Invalid URL format')

		if (parts.length === 1 && parts[0].includes(':')) {
			const coordinate = this.parseCoordinate(parts[0])
			const userId = await this.processUserIdentifier(coordinate.userId, options)

			if (options?.requireIdentifier && !coordinate.identifier) {
				throw error(400, 'Identifier is required')
			}

			return {
				userId,
				identifier: coordinate.identifier,
				kind: coordinate.kind ?? options?.kind,
			}
		}

		const userId = await this.processUserIdentifier(parts[0], options)

		if (options?.requireIdentifier && !parts[1]) {
			throw error(400, 'Identifier is required')
		}

		return {
			userId,
			identifier: parts[1],
			kind: options?.kind,
		}
	}
}
