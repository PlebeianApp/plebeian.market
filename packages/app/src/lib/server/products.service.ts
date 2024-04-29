import { db, eq, products } from '@plebeian/database'
import { error } from '@sveltejs/kit'

export type DisplayProduct = {
	id: string
	name: string
	description: string
	currency: string
	stockQty: number
}

export const getProductsByUserId = (userId: string): DisplayProduct[] => {
	const productsResult = db.select().from(products).where(eq(products.userId, userId)).all()

	const productsRes: DisplayProduct[] = productsResult.map((product) => {
		return {
			id: product.id,
			name: product.productName,
			description: product.description,
			currency: product.currency,
			stockQty: product.stockQty
		}
	})

	if (productsRes) {
		return productsRes
	}

	error(404, 'Not found')
}
