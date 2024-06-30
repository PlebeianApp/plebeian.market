import { getUserIdByNip05, userExists } from '$lib/server/users.service.js'
import ndkStore from '$lib/stores/ndk'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { get } from 'svelte/store'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params
	let userId: string | null = null
	let _userExists: boolean = false

	if (NIP05_REGEX.test(id)) {
		const lowerNip05 = id.toLocaleLowerCase()
		userId = await getUserIdByNip05(lowerNip05)
		if (userId) {
			_userExists = true
		} else {
			const $ndk = get(ndkStore)
			const userNostrRes = await $ndk.getUserFromNip05(lowerNip05)
			if (userNostrRes) {
				userId = userNostrRes.pubkey
				_userExists = false
			}
		}
	} else {
		userId = id
		_userExists = await userExists(userId)
	}
	return {
		id: userId as string,
		exist: _userExists,
	}
}
