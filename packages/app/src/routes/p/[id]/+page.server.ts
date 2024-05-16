import { getProductsByUserId } from '$lib/server/products.service'
import { getStallsByUserId } from '$lib/server/stalls.service'
import { getUserById } from '$lib/server/users.service.js'
import { npubEncode } from 'nostr-tools/nip19'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const userRes = await getUserById(params.id)
	const getStallsByUserIdRes = await getStallsByUserId(params.id)
	const getProductsByUserIdRes = await getProductsByUserId(params.id)

	return {
		npub: npubEncode(userRes.id),
		name: userRes.name,
		image: userRes.image,
		products: getProductsByUserIdRes,
		stalls: getStallsByUserIdRes,
	}
}
