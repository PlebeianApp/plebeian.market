import { getUserIdByNip05 } from '$lib/server/users.service.js'
import ndkStore from '$lib/stores/ndk'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { get } from 'svelte/store'

import type { PageServerLoad } from './$types'

async function processNip05(nip05: string): Promise<{ id: string }> {
	const lowerNip05 = nip05.toLowerCase()
	let userId = await getUserIdByNip05(lowerNip05)

	if (!userId) {
		const $ndk = get(ndkStore)
		const userNostrRes = await $ndk.getUserFromNip05(lowerNip05)
		if (userNostrRes) {
			userId = userNostrRes.pubkey
		}
	}

	return { id: userId || '' }
}

async function processDirectId(id: string): Promise<{ id: string }> {
	return {
		id,
	}
}

export const load: PageServerLoad = async ({ params }): Promise<{ id: string }> => {
	const { id } = params

	try {
		const loadUserInfo = NIP05_REGEX.test(id) ? await processNip05(id) : await processDirectId(id)

		return loadUserInfo
	} catch (e) {
		console.error('Error processing user data:', e)
		return { id: '' }
	}
}
