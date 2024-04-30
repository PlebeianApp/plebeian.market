import { getHomeProducts } from '$lib/server/products.service'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = () => {
	return getHomeProducts()
}
