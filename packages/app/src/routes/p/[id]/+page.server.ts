import { getStallsByUserId } from '$lib/server/stalls.service'
import { getUserById } from '$lib/server/users.service.js'
import { getProductsByUserId } from '$lib/server/products.service'
import { nip19 } from 'nostr-tools'

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	const userRes = getUserById(params.id)
	const getStallsByUserIdRes = getStallsByUserId(params.id)
	const getProductsByUserIdRes = getProductsByUserId(params.id)

	return {
		npub: nip19.npubEncode(userRes.id),
		name: userRes.name,
		image: userRes.image,
		products: getProductsByUserIdRes,
		stalls: getStallsByUserIdRes
	}
}
