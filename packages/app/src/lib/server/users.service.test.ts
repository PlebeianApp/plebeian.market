import { getAllUsers } from '$lib/server/users.service'
import { describe, expect, it } from 'vitest'

import { devUser1 } from '@plebeian/database'

describe('users service', () => {
	it('returns list of users', () => {
		const res = getAllUsers()
		expect(res).toHaveLength(5)
	})

	it('returns user by id', () => {
		const res = getAllUsers()
		expect(res[0].id).toBe(devUser1.pk)
	})
})
