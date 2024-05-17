import type { NostrEvent } from '@nostr-dev-kit/ndk'
import NDK, { NDKEvent, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk'
import { KindProducts, KindStalls } from '$lib/constants'
import { getAllStalls } from '$lib/server/stalls.service'
import { describe, expect, it } from 'vitest'

import { getShippingByStallId } from './shipping.service'

describe('Shipping service', () => {
	it('gets shipping by stall id', async () => {
		const [stalls] = await getAllStalls()

		const shipping = await getShippingByStallId(stalls.id)

		expect(shipping).toBeDefined()
	})
})
