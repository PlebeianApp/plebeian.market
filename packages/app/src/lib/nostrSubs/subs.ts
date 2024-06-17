import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import { KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'

export let stallSub: NDKEventStore<ExtendedBaseType<NDKEvent>>

ndkStore.subscribe((ndk) => {
	stallSub = ndk.storeSubscribe({ kinds: [KindStalls as number], limit: 20 }, { closeOnEose: false, autoStart: false })
})
