import { getAllStalls } from '$lib/server/stalls.service'
import { describe, expect, it } from 'vitest'

import { getShippingByStallId, getShippingZonesByStallId } from './shipping.service'

describe('Shipping service', () => {
	it('gets shipping by stall id', async () => {
		const [stall] = await getAllStalls()

		const shipping = await getShippingByStallId(stall.id)

		expect(shipping).toBeDefined()
	})

	it('gets shipping zones by stall id', async () => {
		const stalls = await getAllStalls()

		const zonesForEachStall = await Promise.all(stalls.map((stall) => getShippingZonesByStallId(stall.id)))

		expect(zonesForEachStall.some((stall) => !!stall.length)).toBeTruthy()
	})
})
