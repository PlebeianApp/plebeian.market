import type { Handle } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'
import { RateLimiter } from 'sveltekit-rate-limiter/server'

import { createAppLogger } from '@plebeian/logger'

const limiter = new RateLimiter({
	IPUA: [50, 'm'], // IP + User Agent limiter
})

const requestLogger = createAppLogger('hooks.server.ts')

export const handle: Handle = async ({ event, resolve }) => {
	const start = Date.now()

	try {
		if (event.url.pathname.startsWith('/api/')) {
			requestLogger.info({
				msg: 'API Request',
				method: event.request.method,
				path: event.url.pathname,
				headers: {
					'user-agent': event.request.headers.get('user-agent'),
				},
			})

			if (!event.url.pathname.startsWith('/api/v1/products') && (await limiter.isLimited(event))) {
				requestLogger.warn({
					msg: 'Rate limit exceeded',
					method: event.request.method,
					path: event.url.pathname,
					headers: {
						'user-agent': event.request.headers.get('user-agent'),
					},
				})
				throw error(429)
			}
		}

		const response = await resolve(event)
		const duration = Date.now() - start

		if (event.url.pathname.startsWith('/api/')) {
			requestLogger.info({
				msg: 'API Request completed',
				method: event.request.method,
				path: event.url.pathname,
				status: response.status,
				duration,
			})
		}

		return response
	} catch (err) {
		const duration = Date.now() - start

		requestLogger.error({
			msg: 'Request failed',
			method: event.request.method,
			path: event.url.pathname,
			error: {
				message: err instanceof Error ? err.message : 'Unknown error',
				status: err instanceof error ? err.status : 500,
				stack: err instanceof Error ? err.stack : undefined,
			},
			duration,
		})

		throw err
	}
}
