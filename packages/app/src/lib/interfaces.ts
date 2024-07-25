export interface EventCoordinates {
	coordinates: string
	kind: number
	pubkey: string
	tagD: string
}

export interface FormDataWithEntries extends FormData {
	entries(): IterableIterator<[string, string]>
}
