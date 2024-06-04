import type { NDKTag } from '@nostr-dev-kit/ndk'
import type { HttpMethod } from '@sveltejs/kit'
import { NDKEvent } from '@nostr-dev-kit/ndk'
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

export type Operation<U extends string, M extends HttpMethod, H extends Record<string, string>, B extends unknown, R extends unknown> = {
	url: U
	method: M
	headers: H
	body: B
	response: R
}

export interface Endpoints {
}

export async function createRequest<K extends keyof Endpoints, RequestOperation extends Endpoints[K]>(
	endpoint: K,
	options: {
		body?: RequestOperation['body']
		headers?: RequestOperation['headers']
		auth?: boolean
	},
) {
	console.log('here')
	const [method, url] = endpoint.split(' ') as [RequestOperation['method'], RequestOperation['url']]
	const headers = new Headers(options.headers)

	if (options.auth) {
		const authToken = await createToken(url, method)
		headers.append('Authorization', authToken)
	}

	return $fetch<RequestOperation['response']>(url, { headers, body: JSON.stringify(options.body), baseURL: window.location.origin })
}
