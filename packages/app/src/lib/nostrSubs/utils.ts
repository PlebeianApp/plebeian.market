import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { DisplayProduct } from '$lib/server/products.service'
import type { RichShippingInfo } from '$lib/server/shipping.service'
import type { RichStall } from '$lib/server/stalls.service'
import type { ZodError } from 'zod'
import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
import { KindProducts, KindStalls, standardDisplayDateFormat } from '$lib/constants'
import { createProductsFromNostrMutation } from '$lib/fetch/products.mutations'
import { createStallFromNostrEvent } from '$lib/fetch/stalls.mutations'
import { userFromNostr } from '$lib/fetch/users.mutations'
import ndkStore from '$lib/stores/ndk'
import { getEventCoordinates, shouldRegister } from '$lib/utils'
import { format } from 'date-fns'
import { get } from 'svelte/store'

import type { ProductImagesType } from '@plebeian/database'

import { productEventSchema, shippingObjectSchema, stallEventSchema } from '../../schema/nostr-events'
import { stallsSub } from './subs'

export async function fetchStallData(stallId: string): Promise<{
	stallNostrRes: NDKEvent | null
}> {
	const $stallsSub = get(stallsSub)
	const $ndkStore = get(ndkStore)
	const [_, userId, stallIdentifier] = stallId.split(':')
	const fetchedStall = $stallsSub.find((nostrStall) => stallId.split(':')[2] == nostrStall.dTag)
	const stallFilter = {
		kinds: [KindStalls],
		authors: [userId],
		'#d': [stallIdentifier],
	}

	const stallNostrRes: NDKEvent | null = fetchedStall
		? fetchedStall
		: await $ndkStore.fetchEvent(stallFilter, { cacheUsage: NDKSubscriptionCacheUsage.CACHE_FIRST })

	return { stallNostrRes }
}

export async function fetchUserStallsData(userId: string): Promise<{
	stallNostrRes: Set<NDKEvent> | null
}> {
	const $ndkStore = get(ndkStore)
	const stallFilter = {
		kinds: [KindStalls],
		authors: [userId],
	}

	const stallNostrRes: Set<NDKEvent> | null = await $ndkStore.fetchEvents(stallFilter, {
		cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
	})

	return { stallNostrRes }
}

export async function fetchUserData(userId: string): Promise<{
	userProfile: NDKUserProfile | null
}> {
	const $ndkStore = get(ndkStore)
	const ndkUser = $ndkStore.getUser({
		pubkey: userId,
	})

	const userProfile = await ndkUser.fetchProfile({ cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY })
	return { userProfile }
}

export async function fetchUserProductData(userId: string): Promise<{
	products: Set<NDKEvent> | null
}> {
	const $ndkStore = get(ndkStore)
	const productsFilter = {
		kinds: [KindProducts],
		authors: [userId],
	}
	const productsNostrRes = await $ndkStore.fetchEvents(productsFilter, { cacheUsage: NDKSubscriptionCacheUsage.PARALLEL })

	return { products: productsNostrRes }
}

export async function fetchProductData(productId: string): Promise<{
	nostrProduct: Set<NDKEvent> | null
}> {
	const [_, userId, identifier] = productId.split(':')
	const $ndkStore = get(ndkStore)
	const productsFilter = {
		kinds: [KindProducts],
		authors: [userId],
		'#d': [identifier],
	}
	const productsNostrRes = await $ndkStore.fetchEvents(productsFilter, { cacheUsage: NDKSubscriptionCacheUsage.PARALLEL })

	return { nostrProduct: productsNostrRes }
}

export async function handleUserNostrData(userData: NDKUserProfile, userId: string): Promise<boolean> {
	const $userFromNostr = get(userFromNostr)
	userData.id = userId
	const userMutation = await $userFromNostr.mutateAsync({ profile: userData, pubkey: userId })
	return userMutation ? true : false
}

export async function handleStallNostrData(stallData: NDKEvent): Promise<boolean> {
	const $createStallFromNostrEvent = get(createStallFromNostrEvent)
	const stallEvent = await stallData.toNostrEvent()
	const stallMutation = await $createStallFromNostrEvent.mutateAsync(stallEvent)
	return stallMutation ? true : false
}

export async function handleProductNostrData(productsData: Set<NDKEvent>): Promise<boolean> {
	const $createProductsFromNostrMutation = get(createProductsFromNostrMutation)
	const productsMutation = await $createProductsFromNostrMutation.mutateAsync(productsData)
	return productsMutation ? true : false
}

export function normalizeStallData(nostrStall: NDKEvent): { data: Partial<RichStall> | null; error: ZodError | null } {
	if (!nostrStall.content) return { data: null, error: null }
	const parsedStallContent = JSON.parse(nostrStall.content)
	const parsedShipping: Partial<RichShippingInfo>[] =
		parsedStallContent.shipping?.map((shipping: unknown) => {
			const { data: shippingData, success, error: parseError } = shippingObjectSchema.safeParse(shipping)
			if (!success) return { data: null, error: parseError }
			return {
				id: shippingData?.id,
				name: shippingData?.name as string,
				cost: shippingData?.cost,
				regions: shippingData.regions,
				countries: shippingData.countries,
			} as RichShippingInfo
		}) ?? []

	const { data, success, error: parseError } = stallEventSchema.passthrough().safeParse(parsedStallContent)
	if (!success && data) return { data, error: parseError }
	const { tagD: identifier, coordinates: id } = getEventCoordinates(nostrStall)
	return {
		data: {
			...data,
			createDate: format(nostrStall.created_at ? nostrStall.created_at * 1000 : '', standardDisplayDateFormat),
			identifier,
			id,
			userId: nostrStall.pubkey,
			shipping: parsedShipping,
		},
		error: null,
	}
}

export function normalizeProductsFromNostr(
	productsData: Set<NDKEvent>,
	userId: string,
	stallId?: string,
): { toDisplayProducts: Partial<DisplayProduct>[]; stallProducts: Set<NDKEvent> } | null {
	const toDisplayProducts: Partial<DisplayProduct>[] = []
	const stallProducts = new Set<NDKEvent>()
	for (const event of productsData) {
		const { data: product, success, error: parseError } = productEventSchema.safeParse(JSON.parse(event.content))
		if (!success) return null

		if (product.stallId == stallId?.split(':')[2]) {
			stallProducts.add(event)
			toDisplayProducts.push({
				...product,
				quantity: product.quantity as number,
				images: product.images?.map((image) => ({
					createdAt: new Date(),
					productId: product.id,
					auctionId: null,
					imageUrl: image,
					imageType: 'gallery' as ProductImagesType,
					imageOrder: 0,
				})),
				userId: userId,
			})
		} else if (!stallId) {
			toDisplayProducts.push({
				...product,
				quantity: product.quantity as number,
				images: product.images?.map((image) => ({
					createdAt: new Date(),
					productId: product.id,
					auctionId: null,
					imageUrl: image,
					imageType: 'gallery' as ProductImagesType,
					imageOrder: 0,
				})),
				userId: userId,
			})
		}
	}
	return { toDisplayProducts, stallProducts }
}

export async function setNostrData(
	stallData: NDKEvent | null,
	userData: NDKUserProfile | null,
	productsData: Set<NDKEvent> | null,
	allowRegister: boolean = false,
	userId: string,
	userExists: boolean = false,
): Promise<{ userInserted: boolean; stallInserted: boolean; productsInserted: boolean } | undefined> {
	let userInserted: boolean = false
	let stallInserted: boolean = false
	let productsInserted: boolean = false
	const _shouldRegister = await shouldRegister(allowRegister, userExists, userId)
	try {
		if (userData) {
			_shouldRegister && (userInserted = await handleUserNostrData(userData, userId))
		}

		if (stallData) {
			_shouldRegister && (stallInserted = await handleStallNostrData(stallData))
		}

		if (productsData?.size) {
			if (stallData) {
				const { coordinates: stallCoordinates } = getEventCoordinates(stallData)
				const result = normalizeProductsFromNostr(productsData, userId, stallCoordinates)
				if (result) {
					const { stallProducts } = result
					_shouldRegister && (productsInserted = await handleProductNostrData(stallProducts))
				}
			} else {
				_shouldRegister && (productsInserted = await handleProductNostrData(productsData))
			}
		}
		return { userInserted, stallInserted, productsInserted }
	} catch (e) {
		console.error(e)
		return undefined
	}
}
