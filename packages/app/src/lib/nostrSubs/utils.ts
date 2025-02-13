import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { DisplayProduct } from '$lib/server/products.service'
import type { RichShippingInfo } from '$lib/server/shipping.service'
import type { RichStall } from '$lib/server/stalls.service'
import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk'
import { invalidateAll } from '$app/navigation'
import { KindProducts, KindsRelays, KindStalls, standardDisplayDateFormat } from '$lib/constants'
import { createProductsFromNostrMutation } from '$lib/fetch/products.mutations'
import { createStallFromNostrEvent } from '$lib/fetch/stalls.mutations'
import { createUserFromNostrMutation } from '$lib/fetch/users.mutations'
import { createUserByIdQuery, createUservalidateNip05Query } from '$lib/fetch/users.queries'
import ndkStore from '$lib/stores/ndk'
import { addCachedEvent, getCachedEvent, updateCachedEvent } from '$lib/stores/session'
import { getEventCoordinates, parseCoordinatesString, resolveQuery } from '$lib/utils'
import { format } from 'date-fns'
import { get, writable } from 'svelte/store'
import { ZodError, ZodSchema } from 'zod'

import type { ProductImage, ProductImagesType } from '@plebeian/database'

import { forbiddenPatternStore, shippingObjectSchema } from '../../schema/nostr-events'
import { stallsSub } from './subs'

export const categoriesStore = writable<Set<string>>(new Set())

export async function fetchStallData(
	stallCoordinate: string,
	subCacheUsage?: NDKSubscriptionCacheUsage,
): Promise<{
	stallNostrRes: NDKEvent | null
}> {
	const $stallsSub = get(stallsSub)
	const $ndkStore = get(ndkStore)
	const [_, userId, stallIdentifier] = stallCoordinate.split(':')
	const fetchedStall = $stallsSub.find((nostrStall) => stallCoordinate.split(':')[2] == nostrStall.dTag)
	const stallFilter = {
		kinds: [KindStalls],
		authors: [userId],
		'#d': [stallIdentifier],
	}

	const stallNostrRes: NDKEvent | null = fetchedStall
		? fetchedStall
		: await $ndkStore.fetchEvent(stallFilter, { cacheUsage: subCacheUsage ?? NDKSubscriptionCacheUsage.PARALLEL })

	return { stallNostrRes }
}

export async function fetchAddressableEvent(coordinates: string, subCacheUsage?: NDKSubscriptionCacheUsage): Promise<NDKEvent | null> {
	const parsed = parseCoordinatesString(coordinates)
	if (!parsed.coordinates) return null

	const $ndkStore = get(ndkStore)

	const filter = {
		kinds: [Number(parsed.kind)],
		authors: [String(parsed.pubkey)],
		'#d': [String(parsed.tagD)],
	}

	try {
		return await $ndkStore.fetchEvent(filter, {
			cacheUsage: subCacheUsage ?? NDKSubscriptionCacheUsage.PARALLEL,
		})
	} catch (error) {
		console.error('Error fetching addressable event:', error)
		return null
	}
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
		cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
	})

	return { stallNostrRes }
}

export async function fetchUserData(
	userId: string,
	subCacheUsage?: NDKSubscriptionCacheUsage,
): Promise<{
	userProfile: NDKUserProfile | null
}> {
	const $ndkStore = get(ndkStore)
	const ndkUser = $ndkStore.getUser({
		pubkey: userId,
	})

	const userProfile = await ndkUser.fetchProfile({ cacheUsage: subCacheUsage ?? NDKSubscriptionCacheUsage.ONLY_RELAY })

	return { userProfile }
}

export async function fetchProductCategories(): Promise<string[]> {
	const $ndkStore = get(ndkStore)
	const filter = {
		kinds: [KindProducts],
	}

	const events = await $ndkStore.fetchEvents(filter, {
		cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
	})

	const categories = new Set<string>()
	events.forEach((event) => {
		event.tags.filter((tag) => tag[0] === 't').forEach((tag) => categories.add(tag[1].toLowerCase()))
	})

	return Array.from(categories).sort()
}

export async function isUserVerified(userId: string): Promise<boolean | null> {
	try {
		const $ndkStore = get(ndkStore)
		const user = $ndkStore.getUser({ pubkey: userId })
		const profile = await resolveQuery(() => createUserByIdQuery(userId, true, true))
		if (!profile?.nip05) return null
		user.profile = profile
		const nip05 = await resolveQuery(() => createUservalidateNip05Query(user))
		return nip05
	} catch (e) {
		console.log(e)
		return null
	}
}

export async function fetchUserRelays(
	userId: string,
	subCacheUsage?: NDKSubscriptionCacheUsage,
): Promise<{
	userRelays: Set<NDKEvent>
}> {
	const $ndkStore = get(ndkStore)

	const userRelays = await $ndkStore.fetchEvents(
		{
			authors: [userId],
			kinds: KindsRelays,
		},
		{
			cacheUsage: subCacheUsage ?? NDKSubscriptionCacheUsage.PARALLEL,
		},
	)
	if (subCacheUsage == NDKSubscriptionCacheUsage.ONLY_CACHE && !userRelays) {
		const userRelays = await $ndkStore.fetchEvents(
			{
				authors: [userId],
				kinds: KindsRelays,
			},
			{
				cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
			},
		)
		return { userRelays }
	}
	return { userRelays }
}

export async function fetchUserProductData(
	userId: string,
	identifier?: string,
): Promise<{
	products: Set<NDKEvent> | null
}> {
	const $ndkStore = get(ndkStore)
	const productsFilter = {
		kinds: [KindProducts],
		authors: [userId],
		...(identifier && { '#d': [identifier] }),
	}
	const productsNostrRes = await $ndkStore.fetchEvents(productsFilter, { cacheUsage: NDKSubscriptionCacheUsage.PARALLEL })

	return { products: productsNostrRes }
}

export async function fetchProductData(
	productId: string,
	subCacheUsage?: NDKSubscriptionCacheUsage,
): Promise<{
	nostrProduct: Set<NDKEvent> | null
}> {
	const [_, userId, identifier] = productId.split(':')
	const $ndkStore = get(ndkStore)
	const productsFilter = {
		kinds: [KindProducts],
		authors: [userId],
		'#d': [identifier],
	}
	const productsNostrRes = await $ndkStore.fetchEvents(productsFilter, {
		cacheUsage: subCacheUsage ?? NDKSubscriptionCacheUsage.ONLY_RELAY,
	})
	if (subCacheUsage == NDKSubscriptionCacheUsage.ONLY_CACHE && !productsNostrRes) {
		return {
			nostrProduct: await $ndkStore.fetchEvents(productsFilter, {
				cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
			}),
		}
	}
	return { nostrProduct: productsNostrRes }
}

export async function handleUserNostrData(userData: NDKUserProfile, userId: string): Promise<boolean> {
	const $createUserFromNostrMutation = get(createUserFromNostrMutation)
	userData.id = userId
	const userMutation = await $createUserFromNostrMutation.mutateAsync({ profile: userData, pubkey: userId })
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
	productsMutation && (await invalidateAll())
	return productsMutation ? true : false
}

export type NormalizedData<T> = { data: Partial<T> | null; error: ZodError | null }

async function normalizeNostrData<T>(
	event: NDKEvent,
	schema: ZodSchema,
	transformer: (data: T, coordinates: ReturnType<typeof getEventCoordinates>) => Partial<T>,
): Promise<NormalizedData<T>> {
	const coordinates = getEventCoordinates(event)
	if (!event.content || !coordinates?.coordinates) return { data: null, error: null }
	const cachedEvent = await getCachedEvent(coordinates.coordinates)
	if (cachedEvent && cachedEvent.createdAt === event.created_at) {
		return { data: cachedEvent.data as Partial<T>, error: cachedEvent.parseError }
	}
	try {
		const parsedContent = JSON.parse(event.content)
		const { data, success, error: parseError } = schema.safeParse(parsedContent)
		const result: NormalizedData<T> = {
			data: success ? transformer(data, coordinates) : null,
			error: parseError ?? null,
		}

		const cacheData = {
			id: coordinates.coordinates,
			createdAt: event.created_at as number,
			insertedAt: Date.now(),
			kind: coordinates.kind,
			pubkey: coordinates.pubkey,
			data: result.data,
			parseError: result.error,
		}
		await (cachedEvent ? updateCachedEvent(coordinates.coordinates, cacheData) : addCachedEvent(cacheData))

		return result
	} catch (error) {
		console.error('Error processing data:', error)
		return { data: null, error: error instanceof ZodError ? error : null }
	}
}

export async function normalizeStallData(nostrStall: NDKEvent): Promise<NormalizedData<RichStall>> {
	return normalizeNostrData<RichStall>(
		nostrStall,
		get(forbiddenPatternStore).createStallEventContentSchema.passthrough(),
		(data, coordinates) => ({
			...data,
			createDate: formatDate(nostrStall.created_at),
			identifier: coordinates?.tagD,
			id: coordinates?.coordinates,
			userId: coordinates?.pubkey,
			shipping: parseShipping(data?.shipping),
			image: nostrStall.tagValue('image'),
		}),
	)
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
	const schema = get(forbiddenPatternStore).createProductEventSchema
	const result = await normalizeNostrData<DisplayProduct>(event, schema, (data, coordinates) => ({
		...data,
		quantity: data.quantity as number,
		images: createProductImages(data.images as unknown as string[], String(coordinates?.coordinates)),
		userId,
		createdAt: formatDate(event.created_at),
		identifier: coordinates?.tagD,
		id: coordinates?.coordinates,
	}))
	if (result.data && (!stallId || result.data.stall_id === stallId)) {
		return { displayProduct: result.data, event }
	}

	return null
}

function createProductImages(images: string[], productId: string): ProductImage[] {
	const imagesMap =
		images.map((imageUrl, index) => ({
			createdAt: new Date(),
			productId,
			auctionId: null,
			imageUrl: imageUrl as string,
			imageType: 'gallery' as ProductImagesType,
			imageOrder: index,
		})) ?? []
	return imagesMap
}

export function formatDate(timestamp: number | undefined): string {
	return format(timestamp ? timestamp * 1000 : '', standardDisplayDateFormat)
}

export async function normalizeProductsFromNostr(
	productsData: Set<NDKEvent>,
	userId: string,
	stallId?: string,
): Promise<{
	toDisplayProducts: Partial<DisplayProduct>[]
	stallProducts: Set<NDKEvent>
} | null> {
	if (!productsData.size) return null
	const processedProducts = await Promise.all(Array.from(productsData).map((event) => processProduct(event, userId, stallId)))
	const validProducts = processedProducts.filter((product): product is NonNullable<typeof product> => product !== null)
	if (!validProducts.length) return null

	return {
		toDisplayProducts: validProducts.map((p) => p.displayProduct),
		stallProducts: new Set(validProducts.map((p) => p.event)),
	}
}
