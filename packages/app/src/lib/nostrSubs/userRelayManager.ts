import NDK, { NDKEvent, NDKRelay, NDKRelayAuthPolicies, normalizeRelayUrl } from '@nostr-dev-kit/ndk'
import { KindsRelays } from '$lib/constants'
import ndkStore from '$lib/stores/ndk'
import { useCachedEventsByUserIdAndKind } from '$lib/stores/session'
import { resolveQuery } from '$lib/utils'
import { get } from 'svelte/store'

type RelayAction = 'add' | 'remove'

function extractRelayUrls(events: Set<NDKEvent>): Set<string> {
	const urls = new Set<string>()
	for (const event of events) {
		try {
			switch (event.kind) {
				case 3: {
					const parsedContent = JSON.parse(event.content)
					Object.entries(parsedContent)
						.filter(
							([_, permissions]) =>
								(permissions as { read: boolean; write: boolean }).read && (permissions as { read: boolean; write: boolean }).write,
						)
						.forEach(([url]) => urls.add(normalizeRelayUrl(url)))
					break
				}
				case 10002: {
					event.tags.filter((tag) => tag[0] == 'r').forEach((tag) => urls.add(normalizeRelayUrl(tag[1])))
					break
				}
				case 10006: {
					// TODO 10006 relays
					break
				}
				case 10007: {
					// TODO 10007 relays
					break
				}
				case 10050: {
					// TODO 10050 relays
					break
				}
				default: {
					console.warn(`Unsupported event kind for relay extraction: ${event.kind}`)
					break
				}
			}
		} catch (error) {
			console.error(`Error processing event of kind ${event.kind}:`, error)
		}
	}
	return urls
}

async function getActiveUserRelayUrls(): Promise<Set<string> | null> {
	const $ndkStore = get(ndkStore)
	if (!$ndkStore.activeUser?.pubkey) return null
	const activeUserRelayEvents = await resolveQuery(() =>
		useCachedEventsByUserIdAndKind({ userId: $ndkStore.activeUser!.pubkey, kinds: KindsRelays }),
	)
	return extractRelayUrls(activeUserRelayEvents)
}

async function handleRelays(relayUrls: Set<string>, action: RelayAction, pool: NDK['pool']) {
	const $ndkStore = get(ndkStore)
	const activeUserRelayUrls = await getActiveUserRelayUrls()

	relayUrls.forEach((url) => {
		const normalizedUrl = normalizeRelayUrl(url)
		if (action === 'add') {
			const relay = new NDKRelay(normalizedUrl, NDKRelayAuthPolicies.signIn({ ndk: $ndkStore, signer: $ndkStore.signer }), $ndkStore)
			if (pool.relays.size < 20) {
				pool.addRelay(relay, true)
			}
		} else if (activeUserRelayUrls && !activeUserRelayUrls.has(normalizedUrl)) {
			pool.removeRelay(normalizedUrl)
		}
	})
}

const handleEvent = async (event: NDKEvent, action: RelayAction) => {
	const $ndkStore = get(ndkStore)
	const relayUrls = extractRelayUrls(new Set([event]))
	const pool = event.kind === 10002 ? $ndkStore.outboxPool || $ndkStore.pool : $ndkStore.pool
	await handleRelays(relayUrls, action, pool)
}

const eventKindActions = new Map([
	[3, handleEvent],
	[10002, handleEvent],
	[10006, handleEvent],
	// [10007, async (event: NDKEvent) => console.log('Event kind 10007(Search relays list):', event)],
	// [10050, async (event: NDKEvent) => console.log('Event kind 10050(Relay list to receive DMs):', event)],
])

export async function manageUserRelays(userRelays: Set<NDKEvent>, action: RelayAction) {
	const handlers = Array.from(userRelays).map((event) => {
		const handler = eventKindActions.get(event.kind as number)
		return handler ? () => handler(event, action) : () => console.log('Unknown event kind:', event)
	})

	await Promise.all(handlers.map((handler) => handler()))
}
