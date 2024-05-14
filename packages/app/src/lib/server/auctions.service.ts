import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { AuctionsFilter } from '$lib/schema'
import { error } from '@sveltejs/kit'
import { KindAuctionProduct, standardDisplayDateFormat } from '$lib/constants'
import { auctionsFilterSchema } from '$lib/schema'
import { getEventCoordinates } from '$lib/utils'
import { add, format } from 'date-fns'

import type { Auction, AuctionStatus, ProductImage, ProductMeta } from '@plebeian/database'
import {
	auctions,
	auctionStatus,
	createId,
	db,
	eq,
	productImages,
	productImagesType,
	productMeta,
	ProductMetaName,
} from '@plebeian/database'

import { auctionEventSchema } from '../../schema/nostr-events'
import { getStallById } from './stalls.service'

export type DisplayAuction = Pick<
	Auction,
	'id' | 'description' | 'productName' | 'currency' | 'stockQty' | 'startingBidAmount' | 'identifier' | 'userId' | 'status'
> & {
	createdAt: string
	startDate: Date | null
	endDate: Date | null
}

const formatAuction = (auction: Auction): DisplayAuction => {
	return {
		...auction,
		createdAt: format(auction.createdAt, standardDisplayDateFormat),
		startDate: auction.startDate,
		endDate: auction.endDate,
	}
}

export const getAllAuctions = async (filter: AuctionsFilter = auctionsFilterSchema.parse({})): Promise<DisplayAuction[]> => {
	const orderBy = {
		createdAt: auctions.createdAt,
		startDate: auctions.startDate,
		endDate: auctions.endDate,
	}[filter.orderBy]

	const auctionsResult = await db.query.auctions.findMany({
		limit: filter.pageSize,
		offset: (filter.page - 1) * filter.pageSize,
		orderBy: (auctions, { asc, desc }) => (filter.order === 'asc' ? asc(orderBy) : desc(orderBy)),
	})

	if (auctionsResult) {
		return auctionsResult.map(formatAuction)
	}

	error(404, 'Not found')
}

export const getAuctionById = async (auctionId: string): Promise<DisplayAuction> => {
	const [auctionResult] = await db.select().from(auctions).where(eq(auctions.id, auctionId)).execute()

	if (!auctionResult) {
		error(404, 'Not found')
	}

	return formatAuction(auctionResult)
}

export const getAuctionsByStallId = async (stallId: string): Promise<DisplayAuction[]> => {
	const auctionsResult = await db.select().from(auctions).where(eq(auctions.stallId, stallId)).execute()

	if (auctionsResult) {
		return auctionsResult.map(formatAuction)
	}

	error(404, 'Not found')
}

export const getAuctionsByUserId = async (auctionId: string): Promise<DisplayAuction[]> => {
	const auctionsResult = await db.select().from(auctions).where(eq(auctions.userId, auctionId)).execute()

	if (auctionsResult) {
		return auctionsResult.map(formatAuction)
	}

	error(404, 'Not found')
}

export const createAuction = async (auctionEvent: NostrEvent, auctionStatus: AuctionStatus): Promise<DisplayAuction> => {
	const eventCoordinates = getEventCoordinates(auctionEvent)
	const auctionEventContent = JSON.parse(auctionEvent.content)
	const parsedAuction = auctionEventSchema.parse({ id: auctionEventContent.id, ...auctionEventContent })

	const stall = await getStallById(parsedAuction.stall_id)

	if (!stall) {
		error(400, 'Stall not found')
	}

	const startDate = parsedAuction.start_date ? new Date(parsedAuction.start_date * 1000) : null

	const newAuction: Auction = {
		id: parsedAuction.id,
		createdAt: new Date(),
		updatedAt: new Date(),
		identifier: eventCoordinates.tagD,
		stallId: parsedAuction.stall_id,
		userId: auctionEvent.pubkey,
		productName: parsedAuction.name,
		description: parsedAuction.description ?? '',
		startingBidAmount: parsedAuction.starting_bid.toString(),
		status: auctionStatus,
		startDate: startDate,
		endDate: startDate ? add(startDate, { seconds: parsedAuction.duration }) : null,
		currency: stall.currency,
		extraCost: '0',
		stockQty: 1,
	}

	const insertSpecs: ProductMeta[] | undefined = parsedAuction.specs?.map((spec) => ({
		id: createId(),
		createdAt: new Date(auctionEvent.created_at!),
		updatedAt: new Date(),
		auctionId: parsedAuction.id,
		metaName: ProductMetaName.SPEC,
		key: spec[0],
		valueText: spec[1],
		valueBoolean: null,
		valueInteger: null,
		valueNumeric: null,
	}))

	const insertProductImages: ProductImage[] | undefined = parsedAuction.images?.map((imageUrl, index) => ({
		createdAt: new Date(),
		auctionId: parsedAuction.id,
		imageUrl,
		imageType: productImagesType[0],
		imageOrder: index + 1,
	}))

	const [auctionResult] = await db.insert(auctions).values(newAuction).returning()

	insertSpecs?.length && (await db.insert(productMeta).values(insertSpecs).returning())
	insertProductImages?.length && (await db.insert(productImages).values(insertProductImages).returning())

	if (auctionResult) {
		return formatAuction(auctionResult)
	}

	return error(500, 'Failed to create auction')
}

export const updateAuction = async (auctionId: string, auctionEvent: NostrEvent): Promise<DisplayAuction> => {
	const auctionEventContent = JSON.parse(auctionEvent.content)
	const parsedAuction = auctionEventSchema.partial().parse({ id: auctionId, ...auctionEventContent })
	const { tagD, coordinates } = getEventCoordinates(auctionEvent)
	const startDate = parsedAuction?.start_date ? new Date(parsedAuction.start_date) : new Date()

	if (!parsedAuction.stall_id) {
		error(400, 'Stall ID is required')
	}

	const stall = await getStallById(parsedAuction.stall_id)

	const insertProduct: Partial<Auction> = {
		id: `${KindAuctionProduct}:${coordinates.split(':')[1]}:${tagD}`,
		createdAt: new Date(),
		updatedAt: new Date(),
		stallId: parsedAuction.stall_id,
		userId: auctionEvent.pubkey,
		productName: parsedAuction.name,
		description: parsedAuction.description,
		startingBidAmount: parsedAuction?.starting_bid?.toString() ?? '',
		status: auctionStatus[0],
		startDate: startDate,
		endDate: add(startDate, { seconds: parsedAuction.duration }),
		currency: stall.currency,
		extraCost: '0', // TODO: Check if this is correct
		stockQty: 1,
	}

	const [auctionResult] = await db
		.update(auctions)
		.set({
			updatedAt: new Date(),
			...insertProduct,
		})
		.where(eq(auctions.id, auctionId))
		.returning()

	if (auctionResult) {
		return formatAuction(auctionResult)
	}

	error(500, 'Failed to update auction')
}
