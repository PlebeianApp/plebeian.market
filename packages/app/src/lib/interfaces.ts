export interface EventCoordinates {
	coordinates: string
	kind: number
	pubkey: string
	tagD: string
}

export interface FormDataWithEntries extends FormData {
	entries(): IterableIterator<[string, string]>
}

export interface MenuItem {
	title: string
	description: string
	value: string
	root: string
	links: Array<{
		title: string
		href: string
		description: string
		public?: boolean
	}>
	public?: boolean
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
		description: string
		public?: boolean
	}>
	public?: boolean
}
