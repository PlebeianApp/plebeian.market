import { EMAIL_REGEX, HEX_KEYS_REGEX } from '$lib/constants'
import { decode } from 'nostr-tools/nip19'

export function isValidNip05(input: string): boolean {
	return EMAIL_REGEX.test(input)
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
