// lib/stores/product-form.ts
import type { Category } from '$lib/fetch/products.mutations'
import type { RichShippingInfo } from '$lib/server/shipping.service'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'

export const PRODUCT_FORM_TABS = ['details', 'categories', 'images', 'shippings'] as const
export type ProductFormTab = (typeof PRODUCT_FORM_TABS)[number]

export interface ProductFormState {
	tab: ProductFormTab
	name: string
	description: string
	price: string
	quantity: string
	stallIdentifier?: string
	categories: Category[]
	images: Partial<ProductImage>[]
	shippings: { shipping: Partial<RichShippingInfo> | null; extraCost: string }[]
}

export const DEFAULT_FORM_STATE: ProductFormState = {
	tab: 'details',
	name: '',
	description: '',
	price: '',
	quantity: '',
	stallIdentifier: undefined,
	categories: [],
	images: [],
	shippings: [],
}

export function createProductFormStore() {
	const store: Writable<ProductFormState> = writable(DEFAULT_FORM_STATE)

	return {
		...store,
		nextTab: () => {
			store.update((state) => ({
				...state,
				tab: PRODUCT_FORM_TABS[PRODUCT_FORM_TABS.indexOf(state.tab) + 1] || state.tab,
			}))
		},
		previousTab: () => {
			store.update((state) => ({
				...state,
				tab: PRODUCT_FORM_TABS[PRODUCT_FORM_TABS.indexOf(state.tab) - 1] || state.tab,
			}))
		},
		reset: () => store.set(DEFAULT_FORM_STATE),
	}
}

export const productFormStore = createProductFormStore()
