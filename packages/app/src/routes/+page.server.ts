import { db, eq, type Stall, stalls, users } from '@plebeian/database'

export interface UsersWithStalls {
	id: string
	displayName: string
	stalls: Stall[]
}

export async function load(): Promise<{ users: UsersWithStalls[] }> {
	const usersResult = db.select().from(users).all()

	const data = usersResult.map((user) => {
		const stallsResult = db.select().from(stalls).where(eq(stalls.userId, user.id)).all()
		return {
			id: user.id,
			displayName: user.displayName,
			stalls: stallsResult
		}
	})

	return {
		users: data
	}
}
