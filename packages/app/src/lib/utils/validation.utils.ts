import { HEX_KEYS_REGEX } from '$lib/constants'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { decode } from 'nostr-tools/nip19'

export function isValidNip05(input: string): boolean {
	return NIP05_REGEX.test(input)
}

export function isValidHexKey(input: string): boolean {
	return HEX_KEYS_REGEX.test(input)
}

export function isValidNpub(input: string): boolean {
	try {
		const { type, data } = decode(input)
		return type === 'npub' && typeof data === 'string' && isValidHexKey(data)
	} catch {
		return false
	}
}
