import { error } from '@sveltejs/kit'
import { KindProducts } from '$lib/constants'
import { productExists } from '$lib/server/products.service'
import { getUserIdByNip05 } from '$lib/server/users.service.js'
import ndkStore from '$lib/stores/ndk'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { get } from 'svelte/store'

import type { PageServerLoad } from './$types'

type ProcessedInfo = {
	userInfo: { id: string | null }
	productId: string
	productIdentifier?: string
}

async function processNip05(nip05: string, productIdentifier: string): Promise<ProcessedInfo> {
	const lowerNip05 = nip05.toLowerCase()
	let userId = await getUserIdByNip05(lowerNip05)

	if (!userId) {
		const $ndk = get(ndkStore)
		const userNostrRes = await $ndk.getUserFromNip05(lowerNip05)
		if (userNostrRes) {
			userId = userNostrRes.pubkey
		}
	}

	return {
		userInfo: { id: userId },
		productId: `${KindProducts}:${userId}:${productIdentifier}`,
		productIdentifier,
	}
}

async function processDirectId(root: string): Promise<ProcessedInfo> {
	const [userId, productIdentifier] = root.split(':')
	return {
		userInfo: {
			id: userId,
		},
		productId: `${KindProducts}:${root}`,
		productIdentifier,
	}
}

async function processFullId(productId: string): Promise<ProcessedInfo> {
	const [, userId, productIdentifier] = productId.split(':')
	return {
		userInfo: {
			id: userId,
		},
		productId,
		productIdentifier,
	}
}

async function getProductInfo(productId: string): Promise<boolean> {
	try {
		return await productExists(productId)
	} catch (e) {
		console.warn(JSON.stringify(e))
		return false
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const { productId } = params
	const parts = productId.split('/')

	if (parts.length < 1 || parts.length > 2) {
		throw error(400, 'Invalid productId format')
	}

	const [root, productIdentifier] = parts
	let processedInfo: ProcessedInfo

	try {
		if (NIP05_REGEX.test(root) && productIdentifier) {
			processedInfo = await processNip05(root, productIdentifier)
		} else if (root.split(':').length === 2) {
			processedInfo = await processDirectId(root)
		} else {
			processedInfo = await processFullId(root)
		}

		const [userInfo, productExists] = await Promise.all([Promise.resolve(processedInfo.userInfo), getProductInfo(processedInfo.productId)])

		return {
			productRes: {
				id: processedInfo.productId,
				identifier: processedInfo.productIdentifier,
				exist: productExists,
			},
			user: userInfo,
		}
	} catch (e) {
		console.error('Error processing product data:', e)
		throw error(500, 'Error processing product data')
	}
}
