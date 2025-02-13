import type { MetaTagsProps } from 'svelte-meta-tags'
import { error } from '@sveltejs/kit'
import { KindProducts } from '$lib/constants'
import { fetchAddressableEvent } from '$lib/nostrSubs/utils'
import { URLProcessor } from '$lib/utils/url.utils'
import WebSocket from 'ws'

import type { PageServerLoad } from './$types'

;(global as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket

export interface ProductCheck {
	id: string
	identifier?: string
	exist: boolean
}

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const urlComponents = await URLProcessor.parseURL(params.productId, {
			requireIdentifier: true,
			kind: KindProducts,
		})

		const productId = URLProcessor.buildCoordinateId(urlComponents)

		const product = await fetchAddressableEvent(`${KindProducts}:${urlComponents.userId}:${urlComponents.identifier}`)

		if (!product) {
			return {
				productRes: {
					id: productId,
				},
				user: { id: urlComponents.userId },
			}
		}

		const content = JSON.parse(product.content)

		const currentUrl = new URL(url.pathname, url.origin)
		const imageUrl = currentUrl.origin + '/social-image.jpg'

		const pageMetaTags = Object.freeze({
			title: content.name,
			description: content.description,
			openGraph: {
				title: content.name,
				description: content.description,
				url: `https://plebeian.market/products/${params.productId}`,
				locale: 'en_US',
				type: 'article',
				images: [
					{
						url: content.images?.[0] ?? imageUrl,
						alt: content.name ?? '',
					},
				],
			},
		}) satisfies MetaTagsProps

		return {
			productRes: {
				id: productId,
			},
			user: { id: urlComponents.userId },
			pageMetaTags,
		}
	} catch (e) {
		if (e instanceof Error && 'status' in e) throw e
		throw error(500, 'Error processing product data')
	}
}
