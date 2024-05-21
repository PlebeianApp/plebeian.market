import { getProductsByUserId } from '$lib/server/products.service'
import { getStallsByUserId } from '$lib/server/stalls.service'
import { getUserById, getUserByNip05 } from '$lib/server/users.service.js'
import { NIP05_REGEX } from 'nostr-tools/nip05'
import { npubEncode } from 'nostr-tools/nip19'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params
	const userRes = NIP05_REGEX.test(id) ? await getUserByNip05(id) : await getUserById(id)
	const getStallsByUserIdRes = await getStallsByUserId(userRes.id)
	const getProductsByUserIdRes = await getProductsByUserId(userRes.id)

	return {
		npub: npubEncode(userRes.id),
		name: userRes.name,
		image: userRes.image,
		products: getProductsByUserIdRes,
		stalls: getStallsByUserIdRes,
	}
}
