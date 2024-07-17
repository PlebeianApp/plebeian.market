import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import { page } from '$app/stores'
import { KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { derived, get } from 'svelte/store'

import type { AppSettings } from '@plebeian/database'

import { normalizeStallData } from './utils'

const ndk = get(ndkStore)

let appSettings: AppSettings

if (typeof window !== 'undefined') {
	page.subscribe((page) => {
		if (page.data) {
			appSettings = page.data.appSettings
		}
	})
}

export const stallsSub: NDKEventStore<ExtendedBaseType<NDKEvent>> = ndk.storeSubscribe(
	{ kinds: [KindStalls], limit: 25 },
	{ closeOnEose: true, autoStart: false },
)
// FIXME problem of missing "d" tag is here
export const validStalls = derived(stallsSub, ($stallsSub) => $stallsSub.map(normalizeStallData).filter((stall) => stall !== null))
