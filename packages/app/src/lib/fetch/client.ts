import type { NDKTag } from '@nostr-dev-kit/ndk'
import type { HttpMethod } from '@sveltejs/kit'
import type { UpdateAppSettingsReturnType } from '$lib/server/setup.service'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { QueryClient } from '@tanstack/svelte-query'
import { $fetch } from 'ofetch'
import { get } from 'svelte/store'

import { KindHttpAuth } from '../constants'
import ndkStore from '../stores/ndk'

const createToken = async (url: string, method: HttpMethod): Promise<`Nostr ${string}`> => {
	const ndk = get(ndkStore)
	const authEvent = new NDKEvent(ndk)
	const uTag: NDKTag = ['u', url]
	const methodTag: NDKTag = ['method', method]
	authEvent.kind = KindHttpAuth
	authEvent.tags = [uTag, methodTag]
	await authEvent.toNostrEvent()
	await authEvent.sign()
	const strEvent = JSON.stringify(authEvent.rawEvent())
	const strEventB64 = btoa(strEvent)
	return `Nostr ${strEventB64}`
}

export type Operation<U extends string, M extends HttpMethod, H extends Record<string, string>, B, R, P> = {
	url: U
	method: M
	headers: H
	body: B
	response: R
	params: P
}

export interface Endpoints {
	'PUT /settings/app/misc': Operation<'/settings/app/misc', 'PUT', never, Record<string, unknown>, UpdateAppSettingsReturnType, never>
}

export async function createRequest<K extends keyof Endpoints, RequestOperation extends Endpoints[K]>(
	endpoint: K,
	options: {
		body?: RequestOperation['body']
		params?: RequestOperation['params']
		headers?: RequestOperation['headers']
		auth?: boolean
		ignoreResponseError?: boolean
	},
) {
	const [method, url] = endpoint.split(' ') as [RequestOperation['method'], RequestOperation['url']]
	const headers = new Headers(options.headers)

	if (options.auth) {
		const authToken = await createToken(url, method)
		headers.append('Authorization', authToken)
	}

	return $fetch<RequestOperation['response']>(url, {
		method,
		params: options.params,
		headers,
		body: JSON.stringify(options.body),
		baseURL: window.location.origin,
		ignoreResponseError: options.ignoreResponseError,
	})
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 30,
		},
	},
})
