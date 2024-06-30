import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { UsersFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'

import type { NewUser, User, UserMeta, UserRoles, UserTrustLevel } from '@plebeian/database'
import { and, db, eq, inArray, products, sql, USER_META, userMeta, users } from '@plebeian/database'

import { userEventSchema } from '../../schema/nostr-events'

export interface RichUser extends User {
	role: UserRoles
	trustLevel: UserTrustLevel
}

const resolveUser = async (user: User): Promise<RichUser> => {
	const [roleRes] = await db
		.select({
			valueText: userMeta.valueText,
		})
		.from(userMeta)
		.where(and(eq(userMeta.userId, user.id), eq(userMeta.metaName, USER_META.ROLE.value)))
		.execute()

	const [trustRes] = await db
		.select({
			valueText: userMeta.valueText,
		})
		.from(userMeta)
		.where(and(eq(userMeta.userId, user.id), eq(userMeta.metaName, USER_META.TRUST_LVL.value)))
		.execute()

	return {
		...user,
		role: roleRes.valueText as UserRoles,
		trustLevel: trustRes.valueText as UserTrustLevel,
	}
}

// TODO: Use profile event (k:0) to create a user... Waiting for ndk bump
export const getAllUsers = async (filter: UsersFilter = usersFilterSchema.parse({})): Promise<User[]> => {
	const orderBy = {
		createdAt: products.createdAt,
	}[filter.orderBy]

	const usersResult = await db.query.users.findMany({
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
		orderBy: (users, { asc, desc }) => (filter.order === 'asc' ? asc(orderBy) : desc(orderBy)),
	})

	if (usersResult) {
		return usersResult
	}

	error(404, 'User not found')
}

export const getRichUsers = async (filter: UsersFilter = usersFilterSchema.parse({})): Promise<RichUser[]> => {
	const orderBy = {
		createdAt: products.createdAt,
		price: products.price,
	}[filter.orderBy]

	const userResult = await db
		.select()
		.from(users)
		.limit(filter.pageSize)
		.offset((filter.page - 1) * filter.pageSize)
		.where(and(filter.userId ? eq(users.id, filter.userId) : undefined))
		.execute()

	const richUsers = await Promise.all(
		userResult.map(async (user) => {
			return await resolveUser(user)
		}),
	)

	if (richUsers) {
		return richUsers
	}

	error(404, 'User not found')
}

export const getUsersByRole = async (filter: UsersFilter = usersFilterSchema.parse({})): Promise<string[]> => {
	if (!filter.role) error(500, 'bad filter')

	const userResult = await db
		.select()
		.from(userMeta)
		.limit(filter.pageSize)
		.offset((filter.page - 1) * filter.pageSize)
		.where(and(eq(userMeta.metaName, USER_META.ROLE.value), eq(userMeta.valueText, filter.role)))
		.execute()
	return userResult.map((user) => user.userId) as string[]
}

export const getUserById = async (id: string): Promise<User> => {
	const [user] = await db.select().from(users).where(eq(users.id, id)).execute()

	if (user) {
		return user
	}

	error(404, 'Not found')
}

export const getNip05ByUserId = async (id: string): Promise<string | null> => {
	const [user] = await db.select({ nip05: users.nip05 }).from(users).where(eq(users.id, id)).execute()

	if (user) {
		return user.nip05
	}

	return null
}

export const getUserByNip05 = async (nip05addr: string): Promise<User> => {
	const [user] = await db.select().from(users).where(eq(users.nip05, nip05addr)).execute()

	if (user) {
		return user
	}

	error(404, 'Not found')
}

export const getUserIdByNip05 = async (nip05addr: string): Promise<string | null> => {
	const [user] = await db.select({ id: users.id }).from(users).where(eq(users.nip05, nip05addr)).limit(1).execute()

	if (user) {
		return user.id
	}
	return null
}

export const getUserForProduct = async (productId: string): Promise<User> => {
	const [product] = await db.select().from(products).where(eq(products.id, productId)).execute()
	const [user] = await db.select().from(users).where(eq(users.id, product.userId)).execute()

	if (user) {
		return user
	}

	error(404, 'Not found')
}

export const createUser = async (
	user: User,
	fromNostr: boolean = false,
	role: UserRoles = 'pleb',
	trustLevel: UserTrustLevel = 'reasonable',
): Promise<User> => {
	const parsedUserProfile = userEventSchema.safeParse(user)
	if (!parsedUserProfile.success) {
		throw Error(JSON.stringify(parsedUserProfile.error))
	}

	const userMetaData = parsedUserProfile.data

	const insertUser: NewUser = {
		id: userMetaData.id,
		createdAt: new Date(),
		updatedAt: new Date(),
		name: userMetaData.name,
		nip05: userMetaData.nip05?.toLowerCase(),
		banner: userMetaData.banner,
		about: userMetaData.about,
		lud06: userMetaData.lud06,
		lud16: userMetaData.lud16,
		displayName: userMetaData.displayName,
		image: userMetaData.image ? userMetaData.image : userMetaData.picture,
		website: userMetaData.website,
		zapService: userMetaData.zapService,
		lastLogin: new Date(),
	}

	const [userResult] = await db.insert(users).values(insertUser).returning()

	if (!userResult) error(500, { message: 'Failed to create user' })

	if (!fromNostr) {
		await Promise.all([
			db.insert(userMeta).values({ userId: userResult.id, metaName: USER_META.ROLE.value, valueText: role }).returning().execute(),
			db
				.insert(userMeta)
				.values({ userId: userResult.id, metaName: USER_META.TRUST_LVL.value, valueText: trustLevel })
				.returning()
				.execute(),
		])
	}

	return userResult
}

export const updateUser = async (userId: string, userProfile: RichUser): Promise<User> => {
	const insertUser: Partial<User> = {
		updatedAt: new Date(),
		name: userProfile.name,
		nip05: userProfile.nip05?.toLowerCase(),
		banner: userProfile.banner,
		about: userProfile.about,
		lud06: userProfile.lud06,
		lud16: userProfile.lud16,
		displayName: userProfile.displayName,
		image: userProfile.image,
		website: userProfile.website,
		zapService: userProfile.zapService,
	}

	const userResult = await db
		.update(users)
		.set({
			...insertUser,
		})
		.where(eq(users.id, userId))
		.returning()

	if (userProfile.role || userProfile.trustLevel) {
		await updateUserMeta(userId, userProfile.role as UserRoles, userProfile.trustLevel as UserTrustLevel)
	}

	if (userResult.length > 0) {
		return userResult[0]
	}

	error(500, 'Failed to update user')
}

export const updateUserFromNostr = async (userId: string, userProfile: NDKUserProfile): Promise<User> => {
	const insertUser: Partial<User> = {
		updatedAt: new Date(),
		name: userProfile.name,
		nip05: userProfile.nip05?.toLowerCase(),
		banner: userProfile.banner,
		about: userProfile.about,
		lud06: userProfile.lud06,
		lud16: userProfile.lud16,
		displayName: userProfile.displayName,
		image: userProfile.image,
		website: userProfile.website,
		zapService: userProfile.zapService,
	}

	const userResult = await db
		.update(users)
		.set({
			...insertUser,
		})
		.where(eq(users.id, userId))
		.returning()

	if (userResult.length > 0) {
		return userResult[0]
	}

	error(500, { message: 'Failed to update user from nostr' })
}

export const updateUserMeta = async (userId: string, role?: UserRoles, trustLevel?: UserTrustLevel): Promise<UserMeta[]> => {
	const result = await Promise.all([
		role &&
			db
				.update(userMeta)
				.set({ valueText: role })
				.where(and(eq(userMeta.userId, userId), eq(userMeta.metaName, USER_META.ROLE.value)))
				.returning(),
		trustLevel &&
			db
				.update(userMeta)
				.set({ valueText: trustLevel })
				.where(and(eq(userMeta.userId, userId), eq(userMeta.metaName, USER_META.TRUST_LVL.value)))
				.returning(),
	]).then((results) => results.flat().filter((result): result is UserMeta => result !== undefined))

	return result ?? error(500, 'Failed to update user')
}

export const deleteUser = async (userId: string): Promise<boolean> => {
	const userResult = await db.delete(users).where(eq(users.id, userId)).returning()

	if (userResult) {
		return true
	}

	error(500, 'Failed to delete user')
}

export const userExists = async (userId: string): Promise<boolean> => {
	const result = await db
		.select({ id: sql`1` })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1)
	return result.length > 0
}

export const usersExists = async (userIds: string[], returnExisting: boolean = false): Promise<string[]> => {
	const result = await db
		.select({ id: sql`1` })
		.from(users)
		.where(inArray(users.id, userIds))

	const resultIds = new Set(userIds.slice(0, result.length))
	if (returnExisting) {
		return userIds.filter((userId) => resultIds.has(userId))
	} else {
		return userIds.filter((userId) => !resultIds.has(userId))
	}
}
