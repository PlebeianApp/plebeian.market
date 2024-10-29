import type { Handle } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'
import { RateLimiter } from 'sveltekit-rate-limiter/server'

const limiter = new RateLimiter({
	IPUA: [20, 'm'], // IP + User Agent limiter
})

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api/') && (await limiter.isLimited(event))) {
		throw error(429)
	}

	return resolve(event)
}
