import type { NDKUser } from '@nostr-dev-kit/ndk'
import type { UsersFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'
import { takeUniqueOrThrow } from '$lib/utils'

import type { NewUser, User } from '@plebeian/database'
import { db, eq, products, UserRoles, users, UserTrustLevel } from '@plebeian/database'

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

	error(404, 'Not found')
}

export const getUserById = async (id: string): Promise<User> => {
	const user = await db.select().from(users).where(eq(users.id, id)).execute()
	const uniqueUser = takeUniqueOrThrow(user)

	if (uniqueUser) {
		return uniqueUser
	}

	error(404, 'Not found')
}

export const getUserForProduct = async (productId: string): Promise<User> => {
	const product = await db.select().from(products).where(eq(products.id, productId)).execute()
	const uniqueProduct = takeUniqueOrThrow(product)
	const user = await db.select().from(users).where(eq(users.id, uniqueProduct.userId)).execute()
	const uniqueUser = takeUniqueOrThrow(user)

	if (uniqueUser) {
		return uniqueUser
	}

	error(404, 'Not found')
}

export const createUser = async (
	userMeta: NDKUser,
	role: UserRoles = UserRoles.PLEB,
	trustLevel: UserTrustLevel = UserTrustLevel.REASONABLE,
): Promise<User> => {
	const parsedUserMeta = userEventSchema.safeParse(userMeta.profile)
	if (!parsedUserMeta.success) throw Error('Bad user meta schema')

	const userMetaData = parsedUserMeta.data

	const insertUser: NewUser = {
		id: userMeta.pubkey,
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
	}

	const userResult = await db.insert(users).values(insertUser).returning()

	const uniqueUser = takeUniqueOrThrow(userResult)

	if (uniqueUser) {
		return uniqueUser
	}

	error(500, 'Failed to create user')
}

export const updateUser = async (userId: string, userMeta: NDKUser): Promise<User> => {
	const parsedUserMeta = userEventSchema.safeParse(userMeta)
	if (!parsedUserMeta.success) throw Error('Bad user meta schema')

	const userMetaData = parsedUserMeta.data

	const insertUser: Partial<User> = {
		updatedAt: new Date(),
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
	}

	const userResult = await db
		.update(users)
		.set({
			updatedAt: new Date(),
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
