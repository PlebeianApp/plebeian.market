import { getUserIdByNip05 } from '$lib/server/users.service'
import ndkStore from '$lib/stores/ndk'
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

export function decodeNpub(npub: string): string | null {
	try {
		const { type, data } = decode(npub)
		return type === 'npub' && typeof data === 'string' ? data : null
	} catch {
		return null
	}
}

export const withTimeout = <T>(promise: Promise<T>, time: number): Promise<T> => {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error('Timeout exceeded'))
		}, time)

		promise
			.then(resolve)
			.catch(reject)
			.finally(() => clearTimeout(timer))
	})
}
