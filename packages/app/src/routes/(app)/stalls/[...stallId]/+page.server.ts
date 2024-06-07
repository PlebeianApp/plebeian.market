import { KindStalls } from '$lib/constants'
import { getShippingZonesByStallId } from '$lib/server/shipping.service'
import { getStallById } from '$lib/server/stalls.service'
import { getUserById, getUserByNip05 } from '$lib/server/users.service.js'
import { NIP05_REGEX } from 'nostr-tools/nip05'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	let userId: string | undefined
	let stallIdentifier: string | undefined

	const parts: string[] = params.stallId.split('/')
	if (parts.length < 1 || parts.length > 2) {
		throw new Error('Invalid stall format')
	}

	const [root, productId] = parts

	if (NIP05_REGEX.test(root) && productId) {
		userId = (await getUserByNip05(root)).id
		stallIdentifier = productId
	}

	const stallRes = userId && stallIdentifier ? await getStallById(`${KindStalls}:${userId}:${stallIdentifier}`) : await getStallById(root)
	const userRes = await getUserById(stallRes.userId)
	const shippingZonesRes = await getShippingZonesByStallId(stallRes.id)
	return {
		stall: stallRes,
		user: userRes,
		zones: shippingZonesRes,
	}
}
