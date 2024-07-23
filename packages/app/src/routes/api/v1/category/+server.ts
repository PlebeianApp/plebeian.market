import { error, json } from '@sveltejs/kit'
import { catsFilterSchema } from '$lib/schema'
import { getAllCategories } from '$lib/server/categories.service'

export async function GET({ url: { searchParams } }) {
	const spObj = Object.fromEntries(searchParams)
	const filter = catsFilterSchema.safeParse(spObj)
	if (!filter.success) {
		return error(400, `Invalid request: ${JSON.stringify(filter.error)}`)
	} else {
		try {
			return json(await getAllCategories(filter.data))
		} catch (e: unknown) {
			if ((e as Response).status == 404) return json([])
			else error((e as Response).status, { message: `${e}` })
		}
	}
}
