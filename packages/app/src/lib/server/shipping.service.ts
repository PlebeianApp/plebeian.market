import { error } from '@sveltejs/kit'

import { db, eq, shipping, shippingZones } from '@plebeian/database'

export const getShippingByStallId = async (stallId: string) => {
	const shippingResult = await db
		.select()
		.from(shipping)
		.where(eq(shipping.stallId, stallId))
		.leftJoin(shippingZones, eq(shipping.id, shippingZones.shippingId))
		.execute()

	if (shippingResult) {
		return shippingResult
	}

	error(404, 'Not found')
}
