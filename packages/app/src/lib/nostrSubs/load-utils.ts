import { HEX_KEYS_REGEX } from '$lib/constants'
import { getUserIdByNip05 } from '$lib/server/users.service'
import ndkStore from '$lib/stores/ndk'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { decode } from 'nostr-tools/nip19'
import { get } from 'svelte/store'

export async function processNip05(nip05: string): Promise<string> {
	const lowerNip05 = nip05.toLowerCase()
	let userId = await getUserIdByNip05(lowerNip05)

	if (!userId) {
		const $ndk = get(ndkStore)
		const userNostrRes = await $ndk.getUserFromNip05(lowerNip05)
		userId = userNostrRes?.pubkey || ''
	}

	return userId
}

export function isValidNip05(input: string): boolean {
	return NIP05_REGEX.test(input)
}

export function isValidNpub(input: string): boolean {
	try {
		const { type, data } = decode(input)
		return type === 'npub' && typeof data === 'string' && isValidHexKey(data)
	} catch {
		return false
	}
}

export function isValidHexKey(input: string): boolean {
	return HEX_KEYS_REGEX.test(input)
}

export function decodeNpub(npub: string): string | null {
	try {
		const { type, data } = decode(npub)
		return type === 'npub' && typeof data === 'string' ? data : null
	} catch {
		return null
	}
}
