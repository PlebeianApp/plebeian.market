import type { Category } from '$lib/fetch/products.mutations'
import type { RichShippingInfo } from '$lib/server/shipping.service'
import { writable } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'

export type ProductFormState = {
	tab?: 'basic' | 'categories' | 'images' | 'shipping'
	name: string
	description: string
	price: string
	quantity: string
	stallIdentifier: string | undefined
	categories: Category[]
	images: Partial<ProductImage>[]
	shippings: { shipping: Partial<RichShippingInfo> | null; extraCost: string }[]
}

export const productFormState = writable<ProductFormState | null>(null)
