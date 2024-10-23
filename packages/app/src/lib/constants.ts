import type { NDKKind } from '@nostr-dev-kit/ndk'

import type { NonEmptyArray } from '@plebeian/database'
import { COUNTRIES_ISO } from '@plebeian/database/constants'

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

export const SHIPPING_TEMPLATES = [
	{
		name: 'Worldwide Standard',
		cost: '0',
		countries: null,
	},
	{
		name: 'Europe Standard',
		cost: '8.00',
		countries: [
			'AUT',
			'BEL',
			'BGR',
			'HRV',
			'CYP',
			'CZE',
			'DNK',
			'EST',
			'FIN',
			'FRA',
			'DEU',
			'GRC',
			'HUN',
			'IRL',
			'ITA',
			'LVA',
			'LTU',
			'LUX',
			'MLT',
			'NLD',
			'POL',
			'PRT',
			'ROU',
			'SVK',
			'SVN',
			'ESP',
			'SWE',
		],
	},
	{
		name: 'Digital Delivery',
		cost: '0',
		countries: null,
	},
	{
		name: 'Local Pickup',
		cost: '0',
		countries: null,
	},
	{
		name: 'Express Worldwide',
		cost: '0',
		countries: null,
	},
	{
		name: 'North America',
		cost: '0',
		countries: ['USA', 'CAN', 'MEX'],
	},
	{
		name: 'South America',
		cost: '0',
		countries: ['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'GUF', 'GUY', 'PRY', 'PER', 'SUR', 'URY', 'VEN'],
	},
	{
		name: 'Asia Pacific',
		cost: '0',
		countries: ['CHN', 'JPN', 'KOR', 'TWN', 'HKG', 'SGP', 'THA', 'VNM', 'MYS', 'IDN', 'PHL', 'AUS', 'NZL'],
	},
	{
		name: 'Middle East',
		cost: '0',
		countries: ['ARE', 'SAU', 'BHR', 'OMN', 'QAT', 'KWT', 'IRN', 'IRQ', 'ISR', 'JOR', 'LBN', 'SYR'],
	},
	{
		name: 'Africa Standard',
		cost: '0',
		countries: ['ZAF', 'EGY', 'MAR', 'TUN', 'DZA', 'NGA', 'KEN', 'GHA', 'SEN', 'TZA', 'UGA', 'ETH'],
	},
	{
		name: 'UK & Ireland',
		cost: '0',
		countries: ['GBR', 'IRL'],
	},
	{
		name: 'Scandinavia',
		cost: '0',
		countries: ['DNK', 'FIN', 'ISL', 'NOR', 'SWE'],
	},
	{
		name: 'Oceania',
		cost: '0',
		countries: ['AUS', 'NZL', 'FJI', 'PNG', 'SLB', 'VUT', 'NCL', 'WSM'],
	},
	{
		name: 'DACH Region',
		cost: '0',
		countries: ['DEU', 'AUT', 'CHE'],
	},
	{
		name: 'Benelux',
		cost: '0',
		countries: ['BEL', 'NLD', 'LUX'],
	},
	{
		name: 'Mediterranean',
		cost: '0	',
		countries: ['ESP', 'PRT', 'ITA', 'GRC', 'MLT', 'CYP', 'HRV', 'SVN'],
	},
]
