import { error } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { getStallById, stallExists } from '$lib/server/stalls.service'
import { getUserIdByNip05, userExists } from '$lib/server/users.service.js'
import ndkStore from '$lib/stores/ndk'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { get } from 'svelte/store'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	let userId: string | undefined = undefined
	let stallId: string
	let _stallIdentifier: string | undefined = undefined
	let _userExists: boolean = false
	let _stallExists: boolean = false

	const parts: string[] = params.stallId.split('/')
	if (parts.length < 1 || parts.length > 2) {
		error(500, { message: 'Invalid stall id format' })
	}

	const [root, stallIdentifier] = parts

	if (NIP05_REGEX.test(root) && stallIdentifier) {
		const lowerNip05 = root.toLocaleLowerCase()
		_stallIdentifier = stallIdentifier
		const userRes = await getUserIdByNip05(lowerNip05)

		if (userRes) {
			userId = userRes
			_userExists = true
		} else {
			const $ndk = get(ndkStore)
			const userNostrRes = await $ndk.getUserFromNip05(lowerNip05)
			if (userNostrRes) {
				userId = userNostrRes.pubkey
				_userExists = false
			}
		}
		stallId = `${KindStalls}:${userId}:${stallIdentifier}`
	} else if (root.split(':').length == 2) {
		userId = root.split(':')[0]
		_stallIdentifier = root.split(':')[1]
		const userRes = await userExists(userId)
		if (userRes) {
			_userExists = true
		}
		stallId = `${KindStalls}:${root}`
	} else {
		userId = root.split(':')[1]
		_stallIdentifier = root.split(':')[2]
		const userRes = await userExists(userId)
		if (userRes) {
			_userExists = true
		}
		stallId = root
	}

	try {
		const stallRes = await stallExists(stallId)
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
