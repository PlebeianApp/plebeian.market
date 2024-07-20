import { init } from '@paralleldrive/cuid2'

export const createId = init({
	length: 10,
})

export const slugify = (str: string, wordLimit?: number): string => {
	let decodedStr: string
	try {
		decodedStr = decodeURIComponent(str)
	} catch {
		decodedStr = str
	}

	const slug = decodedStr
		.normalize('NFC')
		.toLowerCase()
		.trim()
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '')

	if (wordLimit && wordLimit > 0) {
		return slug.split('-', wordLimit).join('-')
	}

	return slug
}

export const createSlugId = (name: string, wordLimit = 3): string => {
	const slugifiedName = slugify(name, wordLimit)
	const uniqueId = createId()
	return `${slugifiedName}-${uniqueId}`
}
