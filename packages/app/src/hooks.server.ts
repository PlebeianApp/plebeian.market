import type { Handle } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'
import { RateLimiter } from 'sveltekit-rate-limiter/server'

const limiter = new RateLimiter({
	IPUA: [50, 'm'], // IP + User Agent limiter
})

export const handle: Handle = async ({ event, resolve }) => {
	console.log(
		'>>>import.meta.env.DEV',
		import.meta.env.DEV,
		'>>>import.meta.env.PROD',
		import.meta.env.PROD,
		'>>>import.meta.env.MODE',
		import.meta.env.MODE,
		'>>>import.meta.env.APP_PORT',
		import.meta.env,
	)
	event.url.pathname.startsWith('/api/') && console.log(event.request.method, event.url.pathname)
	if (event.url.pathname.startsWith('/api/') && !event.url.pathname.startsWith('/api/v1/products') && (await limiter.isLimited(event))) {
		throw error(429)
	}

	return resolve(event)
}
