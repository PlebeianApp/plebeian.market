import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { UsersFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { usersFilterSchema } from '$lib/schema'

import type { NewUser, User, UserMeta, UserRoles, UserTrustLevel } from '@plebeian/database'
import {
	and,
	db,
	eq,
	inArray,
	INITIAL_V4V_PM_SHARE_PERCENTAGE,
	PM_NPUB,
	products,
	sql,
	USER_META,
	USER_ROLES,
	userMeta,
	users,
} from '@plebeian/database'

import { userEventSchema } from '../../schema/nostr-events'
import { setV4VSharesForUser } from './v4v.service'

export interface RichUser extends User {
	role: UserRoles
	trustLevel: UserTrustLevel
}

const resolveUser = async (user: User): Promise<RichUser> => {
	try {
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
			role: roleRes?.valueText as UserRoles,
			trustLevel: trustRes?.valueText as UserTrustLevel,
		}
	} catch (e) {
		if (e instanceof Error) {
			error(500, { message: e.message })
		} else {
			error(500, { message: 'Internal Server Error' })
		}
	}
}
// TODO: Use profile event (k:0) to create a user... use ndk storeProfile prop
export const getAllUsers = async (filter: UsersFilter = usersFilterSchema.parse({})): Promise<User[]> => {
	try {
		const orderBy = {
			createdAt: products.createdAt,
		}[filter.orderBy]

		const usersResult = await db.query.users.findMany({
			limit: filter.pageSize,
			offset: (filter.page - 1) * filter.pageSize,
			orderBy: (users, { asc, desc }) => (filter.order === 'asc' ? asc(orderBy) : desc(orderBy)),
		})

		return usersResult
	} catch (e) {
		if (e instanceof Error) {
			error(404, { message: e.message })
		} else {
			error(404, { message: 'getAllUsers(); User not found' })
		}
	}
}

export const getRichUsers = async (filter: UsersFilter = usersFilterSchema.parse({})): Promise<RichUser[]> => {
	try {
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

		return richUsers
	} catch (e) {
		if (e instanceof Error) {
			error(404, { message: e.message })
		} else {
			error(404, { message: 'getRichUsers(); User not found' })
		}
	}
}

export const getUsersByRole = async (filter: UsersFilter = usersFilterSchema.parse({})): Promise<string[]> => {
	try {
		if (!filter.role) {
			throw new Error('bad filter')
		}

		const userResult = await db
			.select()
			.from(userMeta)
			.limit(filter.pageSize)
			.offset((filter.page - 1) * filter.pageSize)
			.where(and(eq(userMeta.metaName, USER_META.ROLE.value), eq(userMeta.valueText, filter.role)))
			.execute()
		return userResult.map((user) => user.userId) as string[]
	} catch (e) {
		if (e instanceof Error) {
			error(500, { message: e.message })
		} else {
			error(500, { message: 'Internal Server Error' })
		}
	}
}

export const getUserById = async (id: string): Promise<User> => {
	try {
		const [user] = await db.select().from(users).where(eq(users.id, id)).execute()

		if (!user) {
			throw new Error('Not found')
		}

		return user
	} catch (e) {
		if (e instanceof Error) {
			error(404, { message: e.message })
		} else {
			error(404, { message: 'getUserById(); Not found' })
		}
	}
}

export const getNip05ByUserId = async (id: string): Promise<string | null> => {
	try {
		const [user] = await db.select({ nip05: users.nip05 }).from(users).where(eq(users.id, id)).execute()

		if (!user) {
			return null
		}

		return user.nip05
	} catch (e) {
		if (e instanceof Error) {
			error(404, { message: e.message })
		} else {
			error(404, { message: 'getNip05ByUserId(); Not found' })
		}
	}
}

export const getUserByNip05 = async (nip05addr: string): Promise<User> => {
	try {
		const [user] = await db.select().from(users).where(eq(users.nip05, nip05addr)).execute()

		if (!user) {
			throw new Error('Not found')
		}

		return user
	} catch (e) {
		if (e instanceof Error) {
			error(404, { message: e.message })
		} else {
			error(404, { message: 'getUserByNip05(); Not found' })
		}
	}
}

export const getUserIdByNip05 = async (nip05addr: string): Promise<string | null> => {
	try {
		const [user] = await db.select({ id: users.id }).from(users).where(eq(users.nip05, nip05addr)).limit(1).execute()

		if (!user) {
			return null
		}

		return user.id
	} catch (e) {
		if (e instanceof Error) {
			error(404, { message: e.message })
		} else {
			error(404, { message: 'getUserIdByNip05(); Not found' })
		}
	}
}

export const getUserForProduct = async (productId: string): Promise<User> => {
	try {
		const [product] = await db.select().from(products).where(eq(products.id, productId)).execute()
		const [user] = await db.select().from(users).where(eq(users.id, product.userId)).execute()

		if (!user) {
			throw new Error('Not found')
		}

		return user
	} catch (e) {
		if (e instanceof Error) {
			error(404, { message: e.message })
		} else {
			error(404, { message: 'getUserForProduct(); Not found' })
		}
	}
}

export const createUser = async (
	user: User,
	fromNostr: boolean = false,
	role: UserRoles = 'pleb',
	trustLevel: UserTrustLevel = 'reasonable',
): Promise<User> => {
	try {
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
		}
		if (!fromNostr) insertUser.lastLogin = new Date()

		const [userResult] = await db.insert(users).values(insertUser).returning()

		if (!userResult) {
			throw Error('Failed to create user')
		}

		await updateUserMeta(userResult.id, role, trustLevel)

		await setV4VSharesForUser(user.id, [{ amount: INITIAL_V4V_PM_SHARE_PERCENTAGE, target: PM_NPUB }])

		return userResult
	} catch (e) {
		if (e instanceof Error) {
			if (e.message.includes('Failed to create user')) {
				error(500, { message: 'Failed to create user' })
			} else if (e.message.includes('safeParse')) {
				error(400, { message: 'Invalid user data' })
			} else {
				error(500, { message: `Internal Server Error: ${e}` })
			}
		} else {
			error(500, { message: 'Internal Server Error' })
		}
	}
}

export const getUserRole = async (userId: string): Promise<UserRoles> => {
	const [role] = await db
		.select({ valueText: userMeta.valueText })
		.from(userMeta)
		.where(and(eq(userMeta.userId, userId), eq(userMeta.metaName, USER_META.ROLE.value)))
		.execute()
	return role?.valueText as UserRoles
}

export const updateUserRole = async (userId: string, role: UserRoles): Promise<User> => {
	const targetUser = await getUserById(userId)

	if (!targetUser) {
		throw Error('User not found')
	}

	const success = await updateUserMeta(userId, role)

	if (!success) {
		throw Error('Failed to update user role')
	}

	return targetUser
}

export const updateUser = async (userId: string, userProfile: RichUser): Promise<User> => {
	try {
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
			lastLogin: new Date(),
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
		} else {
			throw Error('Failed to update user')
		}
	} catch (e) {
		if (e instanceof Error) {
			error(500, { message: e.message })
		} else {
			error(500, { message: 'Internal Server Error' })
		}
	}
}

export const updateUserFromNostr = async (userId: string, userProfile: NDKUserProfile): Promise<User> => {
	try {
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
		} else {
			throw Error('Failed to update user from nostr')
		}
	} catch (e) {
		if (e instanceof Error) {
			error(500, { message: e.message })
		} else {
			error(500, { message: 'Internal Server Error' })
		}
	}
}

export const updateUserMeta = async (userId: string, role?: UserRoles, trustLevel?: UserTrustLevel): Promise<UserMeta[]> => {
	try {
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

		return result
	} catch (e) {
		if (e instanceof Error) {
			error(500, { message: e.message })
		} else {
			error(500, { message: 'Internal Server Error' })
		}
	}
}

export const deleteUser = async (userId: string): Promise<boolean> => {
	try {
		const userResult = await db.delete(users).where(eq(users.id, userId)).returning()

		if (userResult) {
			return true
		} else {
			throw Error('Failed to delete user')
		}
	} catch (e) {
		if (e instanceof Error) {
			error(500, { message: e.message })
		} else {
			error(500, { message: 'Internal Server Error' })
		}
	}
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

export const isUserEditor = async (userId: string): Promise<boolean> => {
	const userMeta = await getUserMetaByUserId(userId)
	const editorRole = userMeta.find((meta) => meta.metaName === USER_META.ROLE.value && meta.valueText === USER_ROLES.EDITOR)
	return editorRole !== undefined
}

export const isUserAdmin = async (userId: string): Promise<boolean> => {
	const userMeta = await getUserMetaByUserId(userId)
	const adminRole = userMeta.find((meta) => meta.metaName === USER_META.ROLE.value && meta.valueText === USER_ROLES.ADMIN)
	return adminRole !== undefined
}

export const getUserMetaByUserId = async (userId: string): Promise<UserMeta[]> => {
	const result = await db.select().from(userMeta).where(eq(userMeta.userId, userId)).execute()
	return result
}
