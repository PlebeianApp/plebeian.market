import type { LoadUserInfo } from '$lib/server/users.service.js'
import { getUserIdByNip05, userExists } from '$lib/server/users.service.js'
import ndkStore from '$lib/stores/ndk'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { get } from 'svelte/store'

import type { PageServerLoad } from './$types'

async function processNip05(nip05: string): Promise<LoadUserInfo> {
	const lowerNip05 = nip05.toLowerCase()
	let userId = await getUserIdByNip05(lowerNip05)
	let exist = !!userId

	if (!userId) {
		const $ndk = get(ndkStore)
		const userNostrRes = await $ndk.getUserFromNip05(lowerNip05)
		if (userNostrRes) {
			userId = userNostrRes.pubkey
			exist = false
		}
	}

	return { id: userId || '', exist }
}

async function processDirectId(id: string): Promise<LoadUserInfo> {
	return {
		id,
		exist: await userExists(id),
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params

	try {
		const LoadUserInfo = NIP05_REGEX.test(id) ? await processNip05(id) : await processDirectId(id)

		return LoadUserInfo
	} catch (e) {
		console.error('Error processing user data:', e)
		return { id: '', exist: false }
	}
}
