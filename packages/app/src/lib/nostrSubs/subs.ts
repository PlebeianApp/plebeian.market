import type { NDKEvent } from '@nostr-dev-kit/ndk'
import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import type { RichStall } from '$lib/server/stalls.service'
import type { VerifiedEvent } from 'nostr-tools'
import { page } from '$app/stores'
import { KindStalls, standardDisplayDateFormat } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { getEventCoordinates } from '$lib/utils'
import { format } from 'date-fns'
import { derived, get } from 'svelte/store'

import type { AppSettings, Stall } from '@plebeian/database'

import { stallEventSchema } from '../../schema/nostr-events'

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

export const validStalls = derived(stallsSub, ($stallsSub) => $stallsSub.map(normalizeStallData).filter((stall) => stall !== null))

export function normalizeStallData(nostrStall: NDKEvent): Partial<RichStall> | null {
	const { tagD: identifier, coordinates: id } = getEventCoordinates(nostrStall)

	try {
		const { data, success } = stallEventSchema.safeParse(JSON.parse(nostrStall.content))
		if (!success) return null
		return {
			...data,
			createDate: format(nostrStall.created_at ? nostrStall.created_at * 1000 : '', standardDisplayDateFormat),
			identifier,
			id,
			userId: nostrStall.pubkey,
		}
	} catch (error) {
		return null
	}
}
