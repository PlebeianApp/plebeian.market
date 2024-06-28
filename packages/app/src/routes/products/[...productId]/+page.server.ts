import { error } from '@sveltejs/kit'
import { KindProducts } from '$lib/constants'
import { productExists } from '$lib/server/products.service'
import { getUserIdByNip05, userExists } from '$lib/server/users.service.js'
import ndkStore from '$lib/stores/ndk'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { get } from 'svelte/store'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { productId } = params
	let userId: string | undefined = undefined
	let _productIdentifier: string | undefined
	let _userExists: boolean = false
	let _productExists: boolean = false
	let _productId: string

	const parts: string[] = productId.split('/')
	if (parts.length < 1 || parts.length > 2) {
		error(400, { message: 'Invalid productId format' })
	}

	const [root, productIdentifier] = parts

	if (NIP05_REGEX.test(root) && productIdentifier) {
		const lowerNip05 = root.toLocaleLowerCase()
		_productIdentifier = productIdentifier

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
		_productId = `${KindProducts}:${userId}:${_productIdentifier}`
	} else if (root.split(':').length == 2) {
		const [_userId, productIdentifier] = root.split(':')
		userId = _userId
		_productIdentifier = productIdentifier
		const userRes = await userExists(userId)
		if (userRes) {
			_userExists = true
		}
		_productId = `${KindProducts}:${root}`
	} else {
		const [_, userPK, identifier] = productId.split(':')
		userId = userPK
		_userExists = await userExists(userId)
		_productIdentifier = identifier
		_productId = root
	}

	try {
		const productRes = await productExists(_productId)
		if (productRes) {
			_productExists = true
		}
	} catch (e) {
		console.warn(JSON.stringify(e))
	}
	return {
		productRes: { id: _productId, identifier: _productIdentifier, exist: _productExists },
		user: { id: userId, exist: _userExists },
	}
}
