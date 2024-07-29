import type { NDKKind } from '@nostr-dev-kit/ndk'

import type { NonEmptyArray } from '@plebeian/database'

export const numSatsInBtc = 100_000_000
export const standardDisplayDateFormat = 'dd-MM-yyyy'
export const KindAuctionProduct = 30020
export const KindProducts: NDKKind = 30018 as const
export const KindStalls: NDKKind = 30017 as const
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
