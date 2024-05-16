import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { UsersFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'

import type { NewUser, User, UserRoles, UserTrustLevel } from '@plebeian/database'
import { db, eq, products, users } from '@plebeian/database'

import { userEventSchema } from '../../schema/nostr-events'

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

export const getUserById = async (id: string): Promise<User> => {
	const [user] = await db.select().from(users).where(eq(users.id, id)).execute()

	if (user) {
		return user
	}

	error(404, 'Not found')
}

export const getUserForProduct = async (productId: string): Promise<User> => {
	const [product] = await db.select().from(products).where(eq(products.id, productId)).execute()
	const [user] = await db.select().from(users).where(eq(users.id, product.userId)).execute()

	if (user) {
		return user
	}

	error(404, 'Not found')
}

export const createUser = async (user: object, role: UserRoles = 'pleb', trustLevel: UserTrustLevel = 'reasonable'): Promise<User> => {
	const parsedUserMeta = userEventSchema.safeParse(user)
	if (!parsedUserMeta.success) throw Error(JSON.stringify(parsedUserMeta.error))

	const userMetaData = parsedUserMeta.data

	const insertUser: NewUser = {
		id: userMetaData.id,
		createdAt: new Date(),
		updatedAt: new Date(),
		role: role,
		trustLevel: trustLevel,
		name: userMetaData.name,
		nip05: userMetaData.nip05,
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

	if (userResult) {
		return userResult
	}

	error(500, 'Failed to create user')
}

export const updateUser = async (userId: string, userMeta: NDKUserProfile): Promise<User> => {
	const insertUser: Partial<User> = {
		updatedAt: new Date(),
		name: userMeta.name,
		nip05: userMeta.nip05,
		banner: userMeta.banner,
		about: userMeta.about,
		lud06: userMeta.lud06,
		lud16: userMeta.lud16,
		displayName: userMeta.displayName,
		image: userMeta.image,
		website: userMeta.website,
		zapService: userMeta.zapService,
		lastLogin: new Date(),
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

	error(500, 'Failed to update user')
}

export const deleteUser = async (userId: string): Promise<boolean> => {
	const userResult = await db.delete(users).where(eq(users.id, userId)).execute()

	if (userResult) {
		return true
	}

	error(500, 'Failed to delete user')
}
