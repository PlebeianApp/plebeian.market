import type { NDKRelay } from '@nostr-dev-kit/ndk'
import { writable } from 'svelte/store'

export interface RelayReport {
	timestamp: number
	relayUrls: string[]
	eventKind: string
}

const MAX_REPORTS = 5

function createRelayReports() {
	const { subscribe, update } = writable<RelayReport[]>([])

	return {
		subscribe,
		addReport: (relays: Set<NDKRelay>, eventKind: string) => {
			update((reports) => {
				const relayUrls = Array.from(relays).map((relay) => relay.url)
				const newReport = {
					timestamp: Date.now(),
					relayUrls,
					eventKind,
				}
				return [newReport, ...reports].slice(0, MAX_REPORTS)
			})
		},
		clear: () => update(() => []),
	}
}

export const relayReports = createRelayReports()
