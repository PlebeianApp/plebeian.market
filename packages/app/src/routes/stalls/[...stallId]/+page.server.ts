import { error } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { getStallById } from '$lib/server/stalls.service'
import { getUserIdByNip05, userExists } from '$lib/server/users.service.js'
import ndkStore from '$lib/stores/ndk'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { get } from 'svelte/store'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	let userId: string | undefined = undefined
	let _stallIdentifier: string | undefined = undefined
	let _userExists: boolean = false
	let _stallExists: boolean = false

	const parts: string[] = params.stallId.split('/')
	if (parts.length < 1 || parts.length > 2) {
		error(500, { message: 'Invalid stall id format' })
	}

	const [root, stallIdentifier] = parts

	if (NIP05_REGEX.test(root) && stallIdentifier) {
		_stallIdentifier = stallIdentifier
		const userRes = await getUserIdByNip05(root)
		if (userRes) {
			userId = userRes
			_userExists = true
		} else {
			const $ndk = get(ndkStore)
			const userNostrRes = await $ndk.getUserFromNip05(root)
			if (userNostrRes) {
				userId = userNostrRes.pubkey
				_userExists = false
			}
		}
	} else {
		userId = root.split(':')[1]
		_stallIdentifier = root.split(':')[2]
		const userRes = await userExists(userId)
		if (userRes) {
			_userExists = true
		}
	}

	const stallId = userId && stallIdentifier ? `${KindStalls}:${userId}:${stallIdentifier}` : root
	try {
		const stallRes = await getStallById(stallId)
		if (stallRes) {
			_stallExists = true
		}
	} catch (e) {
		console.warn(JSON.stringify(e))
	}

	return {
		stall: { id: stallId, identifier: _stallIdentifier, exist: _stallExists },
		user: { id: userId, exist: _userExists },
	}
}
