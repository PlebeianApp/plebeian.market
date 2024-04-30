import { db, eq, products, type User, users } from '@plebeian/database'
import { error } from '@sveltejs/kit'
import { takeUniqueOrThrow } from '$lib/utils'

export const getAllUsers = (): User[] => {
	const usersResult = db.select().from(users).all()

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
