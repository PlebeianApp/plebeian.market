import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import { page } from '$app/stores'
import { KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import type { AppSettings } from '@plebeian/database'

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
	{ kinds: [KindStalls], limit: 50 },
	{ closeOnEose: true, autoStart: false },
)
