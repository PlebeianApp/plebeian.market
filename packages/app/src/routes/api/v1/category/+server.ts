// TODO Api for categories
import { error, json } from '@sveltejs/kit'
import { catsFilterSchema } from '$lib/schema'
import { getAllCategories } from '$lib/server/categories.service'

export async function GET({ url: { searchParams } }) {
	const spObj = Object.fromEntries(searchParams)
	const filter = catsFilterSchema.safeParse(spObj)
	if (!filter.success) {
		return error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	} else {
		return json(await getAllCategories(filter.data))
	}
}
