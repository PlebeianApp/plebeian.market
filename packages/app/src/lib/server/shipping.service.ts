import { db, eq, shipping, shippingZones } from '@plebeian/database'

export type RichShippingInfo = {
	id: string
	name: string
	cost: string
	isDefault: boolean
	zones: ShippingZonesInfo[]
}

export type ShippingZonesInfo = {
	region: string
	country: string
}

export const getShippingByStallId = async (stallId: string): Promise<RichShippingInfo[]> => {
	const shippingResult = await db.query.shipping.findMany({
		where: eq(shipping.stallId, stallId),
		with: {
			shippingZones: true,
		},
	})

	const shippingInfos: RichShippingInfo[] = shippingResult.map((shipping) => ({
		id: shipping.id,
		name: shipping.name as string,
		cost: shipping.cost,
		isDefault: shipping.isDefault,
		zones: shipping.shippingZones.map((zone) => ({
			region: zone.regionCode,
			country: zone.countryCode,
		})),
	}))
	return shippingInfos
}

export const getShippingZonesByStallId = async (stallId: string): Promise<ShippingZonesInfo[]> => {
	const shippingZonesResult = await db.query.shippingZones.findMany({
		where: eq(shippingZones.stallId, stallId),
	})

	const zones: ShippingZonesInfo[] = shippingZonesResult.map((zone) => ({
		region: zone.regionCode,
		country: zone.countryCode,
	}))

	return zones
}
