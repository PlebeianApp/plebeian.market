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

export class URLProcessor {
	private static async processNip05(nip05: string): Promise<string> {
		const lowerNip05 = nip05.toLowerCase()
		let userId = await getUserIdByNip05(lowerNip05)

		if (!userId) {
			const userNostrRes = await get(ndkStore).getUserFromNip05(lowerNip05, false)
			userId = userNostrRes?.pubkey ?? ''
		}

		if (!userId) {
			throw error(404, `Invalid NIP05 address: ${nip05}`)
		}

		return userId
	}

	private static processNpub(npub: string): string {
		try {
			return decodePk(npub)
		} catch {
			throw error(400, `Invalid Npub: ${npub}`)
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

		throw error(400, 'Invalid user identifier format')
	}

	static buildCoordinateId({ kind, userId, identifier }: URLComponents): string {
		if (!kind) throw error(400, 'Kind is required to build coordinate ID')
		return `${kind}:${userId}${identifier ? `:${identifier}` : ''}`
	}

	static async parseURL(urlPath: string, options?: URLProcessorOptions): Promise<URLComponents> {
		if (!urlPath) throw error(400, 'URL path is required')

		const parts = urlPath.split('/').filter(Boolean)
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
