import type { MetaTagsProps } from 'svelte-meta-tags'
import { fetchUserData } from '$lib/nostrSubs/utils'
import { URLProcessor } from '$lib/utils/url.utils'
import WebSocket from 'ws'

import type { PageServerLoad } from './$types'

;(global as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket

export const load: PageServerLoad = async ({
	params,
}): Promise<{
	id: string
	pageMetaTags: MetaTagsProps | null
}> => {
	const userPubkey = await URLProcessor.processUserIdentifier(params.id)

	if (!userPubkey) {
		return { id: params.id, pageMetaTags: null }
	}

	const profile = await fetchUserData(userPubkey).then((user) => user.userProfile)

	const pageMetaTags = Object.freeze({
		title: profile?.name || profile?.displayName || 'Profile',
		description: profile?.about || 'Check out my profile and products!',
		openGraph: {
			title: profile?.name || profile?.displayName || 'Profile',
			description: profile?.about || 'Check out my profile and products!',
			url: `https://plebeian.market/p/${params.id}`,
			locale: 'en_US',
			type: 'profile',
			images: [
				{
					url: profile?.image || '',
					alt: 'Profile image',
				},
			],
		},
		twitter: {
			cardType: 'summary_large_image' as const,
			site: `https://plebeian.market/p/${params.id}`,
			handle: `https://plebeian.market/p/${params.id}`,
			title: profile?.name || profile?.displayName || 'Profile',
			description: profile?.about || 'Check out my profile and products!',
			image: profile?.image || '',
			imageAlt: profile?.name || profile?.displayName || 'Profile',
		},
	}) satisfies MetaTagsProps

	try {
		const { userId } = await URLProcessor.parseURL(params.id)
		return { id: userId, pageMetaTags }
	} catch (e) {
		console.error('Error processing user data:', e)
		return { id: '', pageMetaTags }
	}
}
