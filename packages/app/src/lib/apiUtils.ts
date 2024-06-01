import type { NDKTag } from '@nostr-dev-kit/ndk'
import type { HttpMethod } from '@sveltejs/kit'
import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk'
import { get } from 'svelte/store'

import type { CatsFilter, ProductsFilter } from './schema'
import { KindHttpAuth } from './constants'
import { productsFilterSchema } from './schema'
import ndkStore from './stores/ndk'

export const createToken = async (url: string, method: HttpMethod): Promise<string> => {
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

// API wrapper methods
export const GETUserFromId = async (userPk: string, authToken?: string): Promise<Response> => {
	const headers = new Headers()
	if (authToken) {
		headers.append('Authorization', authToken)
	}
	return await fetch(new URL(`/api/v1/users/${userPk}`, window.location.origin), {
		method: 'GET',
		headers: headers,
	})
}

export const GETUsers = async (authToken?: string): Promise<Response> => {
	const headers = new Headers()
	if (authToken) {
		headers.append('Authorization', authToken)
	}
	return await fetch(new URL(`/api/v1/users`, window.location.origin), {
		method: 'GET',
		headers: headers,
	})
}

export const PUTUser = async (user: NDKUser): Promise<Response> => {
	const url = `/api/v1/users/${user.pubkey}`
	const method: HttpMethod = 'PUT'
	const authToken = await createToken(url, method)

	const headers = new Headers()
	if (authToken) {
		headers.append('Authorization', authToken)
	}
	headers.append('Content-Type', 'application/json')
	return await fetch(url, {
		method: method,
		headers: headers,
		body: JSON.stringify(user.profile),
	})
}

export const POSTUser = async (user: NDKUser, authToken?: string): Promise<Response> => {
	const headers = new Headers()
	if (authToken) {
		headers.append('Authorization', authToken)
	}
	headers.append('Content-Type', 'application/json')
	return await fetch(new URL('/api/v1/users', window.location.origin), {
		method: 'POST',
		headers: headers,
		body: JSON.stringify({ id: user.pubkey, ...user.profile }),
	})
}

export const DELETEUser = async (userPk: string): Promise<Response> => {
	const url = `/api/v1/users/${userPk}`
	const method: HttpMethod = 'DELETE'
	const authToken = await createToken(url, method)

	const headers = new Headers()
	if (authToken) {
		headers.append('Authorization', authToken)
	}
	headers.append('Content-Type', 'application/json')
	return await fetch(url, {
		method: method,
		headers: headers,
	})
}

// Categories

export const GETAllCategories = async (filter: CatsFilter): Promise<Response> => {
	const headers = new Headers()
	const params = new URLSearchParams()
	Object.entries(filter).forEach(([key, value]) => {
		params.set(key, String(value))
	})
	const res = await fetch(new URL(`api/v1/category?${params}`, window.location.origin), {
		method: 'GET',
		headers: headers,
	})
	return res
}

export const GETCatById = async (catId: string[]): Promise<Response> => {
	const headers = new Headers()
	return await fetch(new URL(`/api/v1/category/${catId}`, window.location.origin), {
		method: 'GET',
		headers: headers,
	})
}

// Products

export const GETAllProducts = async (filter: ProductsFilter = productsFilterSchema.parse({})): Promise<Response> => {
	const headers = new Headers()
	const params = new URLSearchParams()
	Object.entries(filter).forEach(([key, value]) => {
		params.set(key, String(value))
	})
	return await fetch(new URL(`api/v1/products?${params}`, window.location.origin), {
		method: 'GET',
		headers: headers,
	})
}
