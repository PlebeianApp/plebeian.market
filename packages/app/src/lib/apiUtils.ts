import type { NDKTag } from '@nostr-dev-kit/ndk'
import type { HttpMethod } from '@sveltejs/kit'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { get } from 'svelte/store'

import { KindHttpAuth } from './constants'
import ndkStore from './stores/ndk'

export const createToken = async (url: string, method: HttpMethod): Promise<string> => {
	try {
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
	} catch (e) {
		return ``
	}
}
