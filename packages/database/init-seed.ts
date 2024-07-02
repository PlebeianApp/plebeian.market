import { sql } from 'drizzle-orm'

import { db } from './database'
import { AppSettings } from './types'

const main = async () => {
	const appSettings = {
		instancePk: '0000000000000000000000000000000000000000000000000000000000000000',
		isFirstTimeRunning: true,
	} as AppSettings

	db.run(sql`PRAGMA foreign_keys = OFF;`)

	console.log('Reset start')
	const dbSchema = db._.fullSchema
	await Promise.all([
		db.delete(dbSchema.appSettings),
		db.delete(dbSchema.stalls),
		db.delete(dbSchema.products),
		db.delete(dbSchema.categories),
		db.delete(dbSchema.productCategories),
		db.delete(dbSchema.productImages),
		db.delete(dbSchema.auctions),
		db.delete(dbSchema.metaTypes),
		db.delete(dbSchema.productMeta),
		db.delete(dbSchema.bids),
		db.delete(dbSchema.orders),
		db.delete(dbSchema.orderItems),
		db.delete(dbSchema.invoices),
		db.delete(dbSchema.shipping),
		db.delete(dbSchema.shippingZones),
		db.delete(dbSchema.paymentDetails),
		db.delete(dbSchema.events),
		db.delete(dbSchema.userMeta),
		db.delete(dbSchema.users),
	])
	console.log('Reset done')

	console.log('Seed start')
	await db.transaction(async (tx) => {
		for (const { table, data } of [{ table: dbSchema.appSettings, data: appSettings }]) {
			await tx.insert(table).values(data).execute()
		}
	})

	db.run(sql`PRAGMA foreign_keys = ON;`)

	console.log('Seed done')
}

await main()
