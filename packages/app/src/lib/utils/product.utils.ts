import type { DisplayProduct } from '$lib/server/products.service'
import type { RichStall } from '$lib/server/stalls.service'
import AuthDialog from '$lib/components/dialogs/authDialog.svelte'
import { createStallsByFilterQuery } from '$lib/fetch/stalls.queries'
import { dialogs } from '$lib/stores/dialog'
import { openDrawerForNewProduct, openDrawerForNewStall } from '$lib/stores/drawer-ui'
import ndkStore from '$lib/stores/ndk'
import { resolveQuery } from '$lib/utils'
import { get } from 'svelte/store'

import type { ProductImage } from '@plebeian/database'
import { createSlugId } from '@plebeian/database/utils'

export function prepareProductData(
	formData: FormData,
	stall: Partial<RichStall>,
	images: Partial<ProductImage>[],
	shippingMethods: { id: string; cost: string }[],
	existingProduct?: Partial<DisplayProduct>,
) {
	const productData = {
		id: existingProduct?.id ?? createSlugId(String(formData.get('name'))),
		stall_id: stall.identifier,
		name: String(formData.get('name')),
		description: String(formData.get('description')),
		images: images.map((img) => img.imageUrl).filter(Boolean) as string[],
		price: Number(formData.get('price')),
		quantity: Number(formData.get('quantity')),
		currency: stall.currency,
		shipping: shippingMethods,
	}

	return productData
}

export async function handleListItems() {
	const $ndkStore = get(ndkStore)
	if (!$ndkStore.activeUser) {
		return dialogs.show(AuthDialog)
	}
	const userStalls = await resolveQuery(() => createStallsByFilterQuery({ userId: $ndkStore.activeUser?.pubkey }))
	return !userStalls?.stalls.length ? openDrawerForNewStall() : openDrawerForNewProduct()
}
