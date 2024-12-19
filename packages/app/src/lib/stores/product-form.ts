import { writable } from 'svelte/store'
import type { Category } from '$lib/fetch/products.mutations'
import type { ProductImage } from '@plebeian/database'
import type { RichShippingInfo } from '$lib/server/shipping.service'

type ProductFormState = {
    tab?: 'basic' | 'categories' | 'images' | 'shippings'
    title: string
    description: string
    price: string
    quantity: string
    stallIdentifier: string | null
    categories: Category[]
    images: Partial<ProductImage>[]
    shippings: { shipping: Partial<RichShippingInfo> | null; extraCost: string }[]
}

export const productFormState = writable<ProductFormState | null>(null) 