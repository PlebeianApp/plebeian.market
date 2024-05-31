import type { NDKTag } from '@nostr-dev-kit/ndk'
import type { HttpMethod } from '@sveltejs/kit'
import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk'
import { get } from 'svelte/store'

import { KindHttpAuth } from './constants'
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
	return await fetch(`/api/v1/users/${userPk}`, {
		method: 'GET',
		headers: headers,
	})
}

export const GETUsers = async (userPk: string, authToken?: string): Promise<Response> => {
	const headers = new Headers()
	if (authToken) {
		headers.append('Authorization', authToken)
	}
	return await fetch(`/api/v1/users`, {
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
	return await fetch('/api/v1/users', {
		method: 'POST',
		headers: headers,
		body: JSON.stringify({ id: user.pubkey, ...user.profile }),
	})
}
