import { getShippingZonesByStallId } from '$lib/server/shipping.service'
import { getStallById } from '$lib/server/stalls.service'
import { getUserById } from '$lib/server/users.service.js'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { stallId } = params
	const stallRes = await getStallById(stallId)
	const userRes = await getUserById(stallRes.userId)
	const shippingZonesRes = await getShippingZonesByStallId(stallId)
	return {
		stall: stallRes,
		user: userRes,
		zones: shippingZonesRes,
	}
}
