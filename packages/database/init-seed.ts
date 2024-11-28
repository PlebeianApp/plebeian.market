import { sql } from 'drizzle-orm'

import type { AppSettingsMetaName, DigitalProductMetaName, ProductMetaName, UserMetaName } from './constants'
import { APP_SETTINGS_META, DIGITAL_PRODUCT_META, GENERAL_META, META_NAMES, PRODUCT_META, USER_META } from './constants'
import { db } from './database'
import type { AppSettings } from './types'

const main = async () => {
	const appSettings = {
		instancePk: '0000000000000000000000000000000000000000000000000000000000000000',
		instanceSk: '0000000000000000000000000000000000000000000000000000000000000000',
		isFirstTimeRunning: true,
	} as AppSettings

	const metaTypeData = Object.values(META_NAMES).map((metaName) => {
		let scope: string

		if (
			Object.values(PRODUCT_META)
				.map((meta) => meta.value)
				.includes(metaName as ProductMetaName['value']) ||
			Object.values(DIGITAL_PRODUCT_META)
				.map((meta) => meta.value)
				.includes(metaName as DigitalProductMetaName['value'])
		) {
			scope = 'products'
		} else if (
			Object.values(APP_SETTINGS_META)
				.map((meta) => meta.value)
				.includes(metaName as AppSettingsMetaName['value'])
		) {
			scope = 'app_settings'
		} else if (
			Object.values(USER_META)
				.map((meta) => meta.value)
				.includes(metaName as UserMetaName['value'])
		) {
			scope = 'users'
		} else {
			scope = 'products'
		}

		const metaTypes = [
			...Object.entries(PRODUCT_META),
			...Object.entries(DIGITAL_PRODUCT_META),
			...Object.entries(APP_SETTINGS_META),
			...Object.entries(USER_META),
			...Object.entries(GENERAL_META),
		].map(([_, { value, dataType }]) => ({ value, dataType }))
		const findMetaType = metaTypes.find((meta) => meta.value === metaName)
		const dataType = findMetaType?.dataType ?? 'text'

		const metaType = {
			name: metaName,
			scope: scope,
			dataType,
		}

		return metaType
	})

	db.run(sql`PRAGMA foreign_keys = OFF;`)

	console.log('Reset start')
	const dbSchema = db._.fullSchema
	await Promise.all([
		db.delete(dbSchema.appSettings),
		db.delete(dbSchema.stalls),
		db.delete(dbSchema.products),
		db.delete(dbSchema.eventTags),
		db.delete(dbSchema.productImages),
		db.delete(dbSchema.auctions),
		db.delete(dbSchema.metaTypes),
		db.delete(dbSchema.productMeta),
		db.delete(dbSchema.bids),
		db.delete(dbSchema.orders),
		db.delete(dbSchema.orderItems),
		db.delete(dbSchema.productShipping),
		db.delete(dbSchema.invoices),
		db.delete(dbSchema.shipping),
		db.delete(dbSchema.shippingZones),
		db.delete(dbSchema.paymentDetails),
		db.delete(dbSchema.userMeta),
		db.delete(dbSchema.users),
	])
	console.log('Reset done')

	console.log('Seed start')
	await db.transaction(async (tx) => {
		for (const { table, data } of [
			{ table: dbSchema.appSettings, data: appSettings },
			{ table: dbSchema.metaTypes, data: metaTypeData.flat(1) },
		]) {
			await tx.insert(table).values(data).execute()
		}
	})

	db.run(sql`PRAGMA foreign_keys = ON;`)

	console.log('Seed done')
}

await main()
