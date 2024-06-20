import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import { KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'

export let stallsSub: NDKEventStore<ExtendedBaseType<NDKEvent>>

ndkStore.subscribe((ndk) => {
	stallsSub = ndk.storeSubscribe({ kinds: [KindStalls as number], limit: 30 }, { closeOnEose: false, autoStart: false })
})
