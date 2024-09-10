import type { NDKKind } from '@nostr-dev-kit/ndk'

import type { NonEmptyArray } from '@plebeian/database'

export const numSatsInBtc = 100_000_000
export const standardDisplayDateFormat = 'dd-MM-yyyy'
export const KindAuctionProduct = 30020
export const KindProducts: NDKKind = 30018 as const
export const KindStalls: NDKKind = 30017 as const
export const KindsRelays: NDKKind[] = [
	3, 10002, 10006,
	// 10007, 10050 as number
]
export const KindBids = 1021
export const KindHttpAuth = 27235
export const HEX_KEYS_REGEX = /^(?:[0-9a-fA-F]{64})$/
export const availabeLogos = [
	{
		value: '/logo.svg',
		label: 'Plebeian Market',
	},
	{
		value: '/bitcoin.svg',
		label: 'Bitcoin',
	},
	{
		value: '/nostrich.svg',
		label: 'Nostrich',
	},
	{
		value: '/shaka.svg',
		label: 'Shaka',
	},
] as const
type LogoValue = (typeof availabeLogos)[number]['value']

export const validUrls = Object.values(availabeLogos).map((logo) => logo.value) as NonEmptyArray<LogoValue>

export const defaulRelaysUrls: string[] = ['wss://relay.nostr.band', 'wss://nos.lol', 'wss://relay.nostr.net']

export const DEFAULT_ZAP_AMOUNTS = [
	{ displayText: '😊 10 sats', amount: 10 },
	{ displayText: '😄 21 sats', amount: 21 },
	{ displayText: '😃 50 sats', amount: 50 },
	{ displayText: '😁 100 sats', amount: 100 },
	{ displayText: '🤩 1,000 sats', amount: 1000 },
	{ displayText: '🚀 10,000 sats', amount: 10000 },
	{ displayText: '🔥 100,000 sats', amount: 100000 },
	{ displayText: '🤯 1,000,000 sats', amount: 1000000 },
]
