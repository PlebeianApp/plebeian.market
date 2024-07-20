import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { DisplayProduct } from '$lib/server/products.service'
import type { RichShippingInfo } from '$lib/server/shipping.service'
import type { RichStall } from '$lib/server/stalls.service'
import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
import { KindProducts, KindStalls, standardDisplayDateFormat } from '$lib/constants'
import { createProductsFromNostrMutation } from '$lib/fetch/products.mutations'
import { createStallFromNostrEvent } from '$lib/fetch/stalls.mutations'
import { userFromNostr } from '$lib/fetch/users.mutations'
import ndkStore from '$lib/stores/ndk'
import { addCachedEvent, getCachedEvent, updateCachedEvent } from '$lib/stores/session'
import { getEventCoordinates, shouldRegister } from '$lib/utils'
import { format } from 'date-fns'
import { get } from 'svelte/store'
import { ZodError, ZodSchema } from 'zod'

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

type NormalizedData<T> = { data: Partial<T> | null; error: ZodError | null }

async function normalizeNostrData<T>(
	event: NDKEvent,
	schema: ZodSchema,
	transformer: (data: unknown, coordinates: ReturnType<typeof getEventCoordinates>) => Partial<T>,
): Promise<NormalizedData<T>> {
	const coordinates = getEventCoordinates(event)
	if (!event.content || !coordinates) return { data: null, error: null }

	const cachedEvent = await getCachedEvent(coordinates.coordinates)
	if (cachedEvent && cachedEvent.createdAt === event.created_at) {
		return { data: cachedEvent.data as Partial<T>, error: cachedEvent.parseError }
	}

	try {
		const parsedContent = JSON.parse(event.content)
		const { data, success, error: parseError } = schema.safeParse(parsedContent)

		if (!success) return { data: null, error: parseError }

		const transformedData = transformer(data, coordinates)
		const result: NormalizedData<T> = { data: transformedData, error: null }

		// Update cache
		const cacheData = {
			id: coordinates.coordinates,
			createdAt: event.created_at as number,
			kind: coordinates.kind,
			pubkey: coordinates.pubkey,
			data: result.data,
			parseError: result.error,
		}

		if (cachedEvent) {
			await updateCachedEvent(coordinates.coordinates, cacheData)
		} else {
			await addCachedEvent(cacheData)
		}

		return result
	} catch (error) {
		console.error('Error processing data:', error)
		return { data: null, error: error instanceof ZodError ? error : null }
	}
}

export async function normalizeStallData(nostrStall: NDKEvent): Promise<NormalizedData<RichStall>> {
	return normalizeNostrData<RichStall>(nostrStall, stallEventSchema.passthrough(), (data, coordinates) => ({
		...data,
		createDate: formatDate(nostrStall.created_at),
		identifier: coordinates.tagD,
		id: coordinates.coordinates,
		userId: coordinates.pubkey,
		shipping: parseShipping(data.shipping),
		image: nostrStall.tagValue('image'),
	}))
}

function parseShipping(shipping: unknown[]): Partial<RichShippingInfo>[] {
	return (shipping ?? [])
		.map((item) => {
			const { data: shippingData } = shippingObjectSchema.safeParse(item)
			return shippingData
				? ({
						id: shippingData.id,
						name: shippingData.name,
						cost: shippingData.cost,
						regions: shippingData.regions,
						countries: shippingData.countries,
					} as RichShippingInfo)
				: null
		})
		.filter((item): item is RichShippingInfo => item !== null)
}

async function processProduct(
	event: NDKEvent,
	userId: string,
	stallId?: string,
): Promise<{ displayProduct: Partial<DisplayProduct>; event: NDKEvent } | null> {
	const result = await normalizeNostrData<DisplayProduct>(event, productEventSchema, (data, coordinates) => ({
		...data,
		quantity: data.quantity as number,
		images: createProductImages(data),
		userId,
		createdAt: formatDate(event.created_at),
		identifier: coordinates.tagD,
		id: coordinates.coordinates,
	}))

	if (result.data && (!stallId || result.data.stallId === stallId?.split(':')[2])) {
		return { displayProduct: result.data, event }
	}

	return null
}

function createProductImages(
	data: unknown,
): { createdAt: Date; productId: string; auctionId: null; imageUrl: string; imageType: ProductImagesType; imageOrder: number }[] {
	return (
		data.images?.map((image: string, index: number) => ({
			createdAt: new Date(),
			productId: data.id as string,
			auctionId: null,
			imageUrl: image,
			imageType: 'gallery' as ProductImagesType,
			imageOrder: index,
		})) ?? []
	)
}

export function formatDate(timestamp: number | undefined): string {
	return format(timestamp ? timestamp * 1000 : '', standardDisplayDateFormat)
}

export async function normalizeProductsFromNostr(
	productsData: Set<NDKEvent>,
	userId: string,
	stallId?: string,
): Promise<{ toDisplayProducts: Partial<DisplayProduct>[]; stallProducts: Set<NDKEvent> } | null> {
	if (!productsData.size || !stallId) return null

	const processedProducts = await Promise.all(Array.from(productsData).map((event) => processProduct(event, userId, stallId)))

	const validProducts = processedProducts.filter((product): product is NonNullable<typeof product> => product !== null)

	if (!validProducts.length) return null

	return {
		toDisplayProducts: validProducts.map((p) => p.displayProduct),
		stallProducts: new Set(validProducts.map((p) => p.event)),
	}
}

export async function setNostrData(
	stallData: NDKEvent | null,
	userData: NDKUserProfile | null,
	productsData: Set<NDKEvent> | null,
	allowRegister: boolean = false,
	userId: string,
	userExists: boolean = false,
	allowEmptyStall: boolean = true,
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
			if (allowEmptyStall) _shouldRegister && (stallInserted = await handleStallNostrData(stallData))
			else if (productsData?.size) _shouldRegister && (stallInserted = await handleStallNostrData(stallData))
		}
		if (productsData?.size) {
			if (stallData) {
				const { coordinates: stallCoordinates } = getEventCoordinates(stallData)
				const result = await normalizeProductsFromNostr(productsData, userId, stallCoordinates)
				if (result?.stallProducts.size) {
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
