import { faker } from '@faker-js/faker'
import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'

import type { AppSettingsMetaName, DigitalProductMetaName, ProductMetaName, UserMetaName } from './constants'
import { APP_SETTINGS_META, DIGITAL_PRODUCT_META, GENERAL_META, META_NAMES, PRODUCT_META, USER_META } from './constants'
import { db } from './database'
import { devUser1, devUser2, devUser3, devUser4, devUser5, FORBIDDEN_WORDS } from './fixtures'
import { AppMeta, AppSettings, User } from './types'

const randomHexValue = () => {
	return faker.string.hexadecimal({
		length: 64,
		prefix: '',
		casing: 'lower',
	})
}

const main = async () => {
	const appSettings = {
		instancePk: '0000000000000000000000000000000000000000000000000000000000000000',
		instanceSk: '0000000000000000000000000000000000000000000000000000000000000000',
		instanceName: 'PM (beta)',
		isFirstTimeRunning: false,
	} as AppSettings

	const userIds = [devUser1, devUser2, devUser3, devUser4, devUser5].map((user) => ({ id: user.pk }))

	const fullUsers = userIds.map(
		(user) =>
			({
				...user,
				createdAt: faker.date.recent(),
				updatedAt: faker.date.future(),
				name: faker.person.firstName(),
				displayName: faker.person.middleName(),
				about: faker.person.bio(),
				image: faker.image.avatar(),
				banner: faker.image.urlLoremFlickr({ width: 800, height: 400 }),
				nip05: faker.internet.email().toLowerCase(),
				lud06: randomHexValue(),
				lud16: randomHexValue(),
				website: faker.internet.url(),
				zapService: faker.internet.url(),
				lastLogin: faker.date.future(),
			}) as User,
	)

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

	const appMetaData = metaTypeData
		.flat(2)
		.filter((metaType) => metaType.scope === 'app_settings')
		.map((metaType) => {
			const { name } = metaType

			if (name == APP_SETTINGS_META.WORD_BLACKLIST.value) {
				const appMeta: AppMeta[] = []
				FORBIDDEN_WORDS.forEach((value) => {
					const userMeta = {
						id: createId(),
						appId: appSettings.instancePk,
						metaName: name,
						valueText: value,
						valueBoolean: null,
						valueNumeric: null,
						key: null,
						createdAt: faker.date.recent(),
						updatedAt: faker.date.future(),
					} as AppMeta
					appMeta.push(userMeta)
				})
				return appMeta
			}
		})
		.filter(Boolean)

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
			{ table: dbSchema.users, data: fullUsers },
			{ table: dbSchema.appSettingsMeta, data: appMetaData.flat(1) },
			{ table: dbSchema.metaTypes, data: metaTypeData.flat(1) },
		]) {
			await tx.insert(table).values(data).execute()
		}
	})

	db.run(sql`PRAGMA foreign_keys = ON;`)

	console.log('Seed done')
}

await main()
