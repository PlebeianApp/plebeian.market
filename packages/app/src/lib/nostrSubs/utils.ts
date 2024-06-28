import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
import { KindProducts, KindStalls } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { get } from 'svelte/store'

import { stallsSub } from './subs'

export async function fetchStallData(stallId: string): Promise<{
	stallNostrRes: NDKEvent | null
}> {
	const $stallsSub = get(stallsSub)
	const $ndkStore = get(ndkStore)
	const [_, userId, stallIdentifier] = stallId.split(':')
	const fetchedStall = $stallsSub.find((nostrStall) => stallId.split(':')[2] == nostrStall.dTag)
	const stallFilter = {
		kinds: [KindStalls],
		authors: [userId],
		'#d': [stallIdentifier],
	}

	const stallNostrRes: NDKEvent | null = fetchedStall
		? fetchedStall
		: await $ndkStore.fetchEvent(stallFilter, { cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST })

	return { stallNostrRes }
}

export async function fetchUserData(userId: string): Promise<{
	userProfile: NDKUserProfile | null
}> {
	const $ndkStore = get(ndkStore)
	const ndkUser = $ndkStore.getUser({
		pubkey: userId,
	})

	const userProfile = await ndkUser.fetchProfile({ cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST })

	return { userProfile }
}

export async function fetchUserProductData(userId: string): Promise<{
	products: Set<NDKEvent> | null
}> {
	const $ndkStore = get(ndkStore)
	const productsFilter = {
		kinds: [KindProducts],
		authors: [userId],
	}
	const productsNostrRes = await $ndkStore.fetchEvents(productsFilter, { cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST })

	return { products: productsNostrRes }
}

export async function fetchProductData(productId: string): Promise<{
	nostrProduct: NDKEvent | null
}> {
	const [_, userId, identifier] = productId.split(':')
	const $ndkStore = get(ndkStore)
	const productsFilter = {
		kinds: [KindProducts],
		authors: [userId],
		'#d': [identifier],
	}
	const productsNostrRes = await $ndkStore.fetchEvent(productsFilter, { cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST })

	return { nostrProduct: productsNostrRes }
}
