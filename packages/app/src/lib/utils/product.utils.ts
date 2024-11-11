import type { DisplayProduct } from '$lib/server/products.service'
import type { RichStall } from '$lib/server/stalls.service'
import { get } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'
import { createSlugId } from '@plebeian/database/utils'

import { forbiddenPatternStore } from '../../schema/nostr-events'
import { displayZodErrors } from './zod.utils'

export function prepareProductData(
	formData: FormData,
	stall: Partial<RichStall>,
	images: Partial<ProductImage>[],
	shippingMethods: { id: string; cost: string }[],
	existingProduct?: Partial<DisplayProduct>,
) {
	const productData = {
		id: existingProduct?.id ?? createSlugId(String(formData.get('title'))),
		stall_id: stall.identifier,
		name: String(formData.get('title')),
		description: String(formData.get('description')),
		images: images.map((img) => img.imageUrl).filter(Boolean) as string[],
		price: Number(formData.get('price')),
		quantity: Number(formData.get('quantity')),
		currency: stall.currency,
		shipping: shippingMethods,
	}

	return productData
}
