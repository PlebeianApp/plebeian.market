import type { MetaTagsProps } from 'svelte-meta-tags'
import { error } from '@sveltejs/kit'
import { KindStalls } from '$lib/constants'
import { fetchAddressableEvent } from '$lib/nostrSubs/utils'
import { URLProcessor } from '$lib/utils/url.utils'

import type { PageServerLoad } from './$types'

export type StallCheck = {
	id: string
	identifier?: string
}

const getStallInfo = async (stallId: string, stallIdentifier?: string): Promise<StallCheck> => ({
	id: stallId,
	identifier: stallIdentifier,
})

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const urlComponents = await URLProcessor.parseURL(params.stallId, {
			requireIdentifier: true,
			kind: KindStalls,
		})

		const stallId = URLProcessor.buildCoordinateId(urlComponents)
		const [userInfo, stallInfo] = await Promise.all([
			Promise.resolve({ id: urlComponents.userId }),
			getStallInfo(stallId, urlComponents.identifier),
		])

		const stall = await fetchAddressableEvent(`${KindStalls}:${urlComponents.userId}:${urlComponents.identifier}`)

		if (!stall) {
			return { stall: stallInfo, user: userInfo, pageMetaTags: null }
		}

		const content = JSON.parse(stall.content)

		const currentUrl = new URL(url.pathname, url.origin)
		const imageUrl = currentUrl.origin + '/social-image.jpg'

		const pageMetaTags = Object.freeze({
			title: content.name,
			description: content.description,
			openGraph: {
				title: content.name,
				description: content.description,
				url: `https://plebeian.market/community/${params.stallId}`,
				locale: 'en_US',
				type: 'article',
				images: [
					{
						url: content.image ?? imageUrl,
						alt: content.name ?? '',
					},
				],
			},
		}) satisfies MetaTagsProps

		return { stall: stallInfo, user: userInfo, pageMetaTags }
	} catch (e) {
		if (e instanceof Error && 'status' in e) throw e
		throw error(500, 'Error processing stall data')
	}
}
