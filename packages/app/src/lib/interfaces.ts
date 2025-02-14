import type { UserRoles } from '@plebeian/database'

export interface EventCoordinates {
	coordinates: string
	kind: number
	pubkey: string
	tagD: string
}

export interface FormDataWithEntries extends FormData {
	entries(): IterableIterator<[string, string]>
}

export type ExistsResult = { exists: boolean; banned: boolean }

export interface MenuItem {
	title: string
	description: string
	value: string
	root: string
	links: Array<{
		title: string
		href: string
		description?: string
		roles?: Array<UserRoles>
	}>
}
