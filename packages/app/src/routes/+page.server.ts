import type { MetaTagsProps } from 'svelte-meta-tags'
import { getAppSettings } from '$lib/server/setup.service'

import type { AppSettings } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	const currentUrl = new URL(url.pathname, url.origin)
	const imageUrl = currentUrl.origin + '/social-image.jpg'
	const pageMetaTags = Object.freeze({
		title: 'Plebeian Market',
		titleTemplate: '%s | Plebeian Market',
		description: 'Plebeian Market is a decentralized marketplace for buying and selling goods and services.',
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			type: 'website',
			twitterTitle: 'Plebeian Market',
			url: new URL(url.pathname, url.origin).href,
			locale: 'en_US',
			title: 'Plebeian Market',
			description: 'Plebeian Market is a decentralized marketplace for buying and selling goods and services.',
			siteName: 'Plebeian Market',
			images: [
				{
					url: imageUrl,
					alt: 'Plebeian Market',
					width: 800,
					height: 600,
					secureUrl: imageUrl,
					type: 'image/jpeg',
				},
			],
		},
	}) satisfies MetaTagsProps
	const appSettings = (await getAppSettings()) as AppSettings
	return { appSettings, pageMetaTags }
}
