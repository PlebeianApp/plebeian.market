import { describe, expect, it } from 'vitest'

import { decodeJwtToEvent } from './nostrAuth.service'

describe('nostr auth service', () => {
	it('decodes nostr auth token', async () => {
		const token =
			'Nostr eyJpZCI6ImZlOTY0ZTc1ODkwMzM2MGYyOGQ4NDI0ZDA5MmRhODQ5NGVkMjA3Y2JhODIzMTEwYmUzYTU3ZGZlNGI1Nzg3MzQiLCJwdWJrZXkiOiI2M2ZlNjMxOGRjNTg1ODNjZmUxNjgxMGY4NmRkMDllMThiZmQ3NmFhYmMyNGEwMDgxY2UyODU2ZjMzMDUwNGVkIiwiY29udGVudCI6IiIsImtpbmQiOjI3MjM1LCJjcmVhdGVkX2F0IjoxNjgyMzI3ODUyLCJ0YWdzIjpbWyJ1cmwiLCJodHRwczovL2FwaS5zbm9ydC5zb2NpYWwvYXBpL3YxL241c3AvbGlzdCJdLFsibWV0aG9kIiwiR0VUIl1dLCJzaWciOiI1ZWQ5ZDhlYzk1OGJjODU0Zjk5N2JkYzI0YWMzMzdkMDA1YWYzNzIzMjQ3NDdlZmU0YTAwZTI0ZjRjMzA0MzdmZjRkZDgzMDg2ODRiZWQ0NjdkOWQ2YmUzZTVhNTE3YmI0M2IxNzMyY2M3ZDMzOTQ5YTNhYWY4NjcwNWMyMjE4NCJ9'
		const event = decodeJwtToEvent(token)

		const expected = JSON.stringify({
			id: 'fe964e758903360f28d8424d092da8494ed207cba823110be3a57dfe4b578734',
			kind: 27235,
			pubkey: '63fe6318dc58583cfe16810f86dd09e18bfd76aabc24a0081ce2856f330504ed',
			tags: [
				['url', 'https://api.snort.social/api/v1/n5sp/list'],
				['method', 'GET'],
			],
			content: '',
			created_at: 1682327852,
			sig: '5ed9d8ec958bc854f997bdc24ac337d005af372324747efe4a00e24f4c30437ff4dd8308684bed467d9d6be3e5a517bb43b1732cc7d33949a3aaf86705c22184',
		})

		// stringify the event to compare because verifiedEvent contains [verifiedSymbol]: true;

		const stringified = JSON.stringify(event)

		expect(stringified).toEqual(expected)
	})
})
