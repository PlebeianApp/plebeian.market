import { getAllStalls } from '$lib/server/stalls.service'
import { describe, expect, it } from 'vitest'

import { getShippingByStallId, getShippingZonesByStallId } from './shipping.service'

describe('Shipping service', () => {
	it('gets shipping by stall id', async () => {
		const [stalls] = await getAllStalls()

		const shipping = await getShippingByStallId(stalls.id)

		expect(shipping).toBeDefined()
	})

	it('gets shipping zones by stall id', async () => {
		const [stalls] = await getAllStalls()

		const zones = await getShippingZonesByStallId(stalls.id)

		expect(zones).toBeDefined()
	})
})
