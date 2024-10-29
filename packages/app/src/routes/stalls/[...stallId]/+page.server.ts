import { error } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { isValidNip05 } from '$lib/nostrSubs/load-utils'
import { getUserIdByNip05 } from '$lib/server/users.service.js'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { PageServerLoad } from './$types'

export type StallCheck = {
	id: string
	identifier?: string
	// exist: boolean
}

type ProcessedInfo = {
	userInfo: { id: string | null }
	stallId: string
	stallIdentifier?: string
}

const processNip05 = async (nip05: string, stallIdentifier: string): Promise<ProcessedInfo> => {
	const lowerNip05 = nip05.toLowerCase()
	const userId = (await getUserIdByNip05(lowerNip05)) || (await get(ndkStore).getUserFromNip05(lowerNip05, false))?.pubkey || null

	return {
		userInfo: {
			id: userId,
		},
		stallId: `${KindStalls}:${userId}:${stallIdentifier}`,
		stallIdentifier,
	}
}

const processDirectId = async (root: string): Promise<ProcessedInfo> => {
	const [userId, stallIdentifier] = root.split(':')
	return {
		userInfo: {
			id: userId,
		},
		stallId: `${KindStalls}:${root}`,
		stallIdentifier,
	}
}

const processFullId = async (stallId: string): Promise<ProcessedInfo> => {
	const [, userId, stallIdentifier] = stallId.split(':')
	return {
		userInfo: {
			id: userId,
		},
		stallId,
		stallIdentifier,
	}
}

const getStallInfo = async (stallId: string, stallIdentifier?: string): Promise<StallCheck> => {
	return {
		id: stallId,
		identifier: stallIdentifier,
		// exist: await stallExists(stallId).catch(() => false),
	}
}

export const load: PageServerLoad = async ({ params }) => {
	const parts = params.stallId.split('/')
	if (parts.length < 1 || parts.length > 2) {
		throw error(400, 'Invalid stall id format')
	}

	const [root, stallIdentifier] = parts
	let processedInfo: ProcessedInfo

	try {
		if (isValidNip05(root) && stallIdentifier) {
			processedInfo = await processNip05(root, stallIdentifier)
		} else if (root.split(':').length === 2) {
			processedInfo = await processDirectId(root)
		} else {
			processedInfo = await processFullId(root)
		}

		const [userInfo, stallInfo] = await Promise.all([
			Promise.resolve(processedInfo.userInfo),
			getStallInfo(processedInfo.stallId, processedInfo.stallIdentifier),
		])

		return { stall: stallInfo, user: userInfo }
	} catch (e) {
		console.error('Error processing stall data:', e)
		throw error(500, 'Error processing stall data')
	}
}
