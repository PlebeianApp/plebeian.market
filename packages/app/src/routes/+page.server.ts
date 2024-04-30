import { getAllProducts } from '$lib/server/products.service'

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	const featuresProducts = getAllProducts().slice(0, 4)
	const coolProducts = getAllProducts().slice(4, 12)
	const coolEvents = getAllProducts().slice(12, 16)
	return {
		featuresProducts,
		coolProducts,
		coolEvents
	}
}
