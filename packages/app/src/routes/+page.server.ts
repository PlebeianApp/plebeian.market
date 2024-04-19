import { db, type Stall } from '@plebeian/database'

export interface UsersWithStalls {
	id: string
	displayName: string
	stalls: Stall[]
}

export async function load(): Promise<{ users: UsersWithStalls[] }> {
	const data = await db.query.users.findMany({
		with: {
			stalls: true
		}
	})

	return {
		users: data
	}
}
