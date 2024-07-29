import { db, eq, shipping, shippingZones } from '@plebeian/database'

export type RichShippingInfo = {
	id: string
	name: string
	cost: string
	isDefault: boolean
	regions: string[] | null
	countries: string[] | null
}

export const getShippingMethodById = async (methodId: string): Promise<RichShippingInfo[]> => {
	const shippingResult = await db.query.shipping.findMany({
		where: eq(shipping.id, methodId),
		with: {
			shippingZones: true,
		},
	})

	const shippingInfos: RichShippingInfo[] = shippingResult.map((shipping) => ({
		id: shipping.id,
		name: shipping.name as string,
		cost: shipping.cost,
		isDefault: shipping.isDefault,
		regions: shipping.shippingZones.map((zone) => zone.regionCode).filter((region) => region !== null) as string[],
		countries: shipping.shippingZones.map((zone) => zone.countryCode).filter((country) => country !== null) as string[],
	}))
	return shippingInfos
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
		regions: shipping.shippingZones.map((zone) => zone.regionCode).filter((region) => region !== null) as string[],
		countries: shipping.shippingZones.map((zone) => zone.countryCode).filter((country) => country !== null) as string[],
	}))

	return shippingInfos
}

export const getShippingZonesByStallId = async (stallId: string): Promise<{ regions: string[]; countries: string[] }> => {
	const shippingZonesResult = await db.query.shippingZones.findMany({
		where: eq(shippingZones.stallId, stallId),
	})

	const regions = shippingZonesResult.flatMap((zone) => (zone.regionCode ? [zone.regionCode] : []))
	const countries = shippingZonesResult.flatMap((zone) => (zone.countryCode ? [zone.countryCode] : []))

	return { regions, countries }
}
