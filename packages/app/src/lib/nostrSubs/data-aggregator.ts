import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { queryClient } from '$lib/fetch/client'
import { createUserByIdQuery } from '$lib/fetch/users.queries'
import {
	checkIfProductExists,
	checkIfStallExists,
	checkIfUserExists,
	getElapsedTimeInDays,
	getEventCoordinates,
	resolveQuery,
	shouldRegister,
} from '$lib/utils'

import { fetchUserData, handleProductNostrData, handleStallNostrData, handleUserNostrData } from './utils'

const userQueue: Set<NDKUserProfile> = new Set()
const stallQueue: Set<NDKEvent> = new Set()
const productQueue: Set<NDKEvent> = new Set()

const BATCH_SIZE = 10
const BATCH_DELAY = 1000 * 10

export function aggregatorAddUser(user: NDKUserProfile | null, userId: string) {
	if (!user) user = {} as NDKUserProfile
	user.id = userId
	userQueue.add(user)
}

export function aggregatorAddStall(stall: NDKEvent) {
	stallQueue.add(stall)
}

export function aggregatorAddProduct(product: NDKEvent) {
	productQueue.add(product)
}

export function aggregatorAddProducts(products: Set<NDKEvent>) {
	for (const product of products) {
		productQueue.add(product)
	}
}

function clearQueues() {
	userQueue.clear()
	stallQueue.clear()
	productQueue.clear()
}

async function processBatch(userIds: string[], allowRegister: boolean) {
	const batchUserIds = userIds.slice(0, BATCH_SIZE)

	for (const userId of batchUserIds) {
		const userExists = await checkIfUserExists(userId)
		const shouldRegisterUser = await shouldRegister(allowRegister, userExists, userId)
		if (shouldRegisterUser) {
			let user = Array.from(userQueue).find((u) => u.id === userId)
			if (!user) user = (await resolveQuery(() => createUserByIdQuery(userId))) ?? undefined
			const userStalls = Array.from(stallQueue).filter((stall) => getEventCoordinates(stall)?.pubkey === userId)
			const userProducts = new Set(Array.from(productQueue).filter((product) => getEventCoordinates(product)?.pubkey === userId))

			if (user && !userExists.exists) {
				await handleUserNostrData(user, userId)
			}

			if (userProducts.size > 0 && userStalls.length) {
				for (const stall of userStalls) {
					const stallCoordinates = getEventCoordinates(stall)
					const stallPubkey = stallCoordinates?.pubkey
					const stallExists = await checkIfStallExists(`${stallCoordinates?.kind}:${stallPubkey}:${stallCoordinates?.tagD}`)

					if (stallExists.banned) {
						continue
					}

					if (!stallExists.exists) {
						await handleStallNostrData(stall)
					}

					try {
						for (const product of userProducts) {
							const productCoordinates = getEventCoordinates(product)
							const productExists = await checkIfProductExists(
								`${productCoordinates?.kind}:${productCoordinates?.pubkey}:${productCoordinates?.tagD}`,
							)

							if (!productExists.exists && !productExists.banned) {
								await handleProductNostrData(userProducts)
							}
						}
					} catch {
						console.warn('Cannot insert products')
					}
				}
			}
		}
	}

	return userIds.slice(BATCH_SIZE)
}

export async function processQueuedInsertions(allowRegister?: boolean) {
	if (
		![stallQueue, productQueue, userQueue].some((queue) => queue.size > 0) ||
		allowRegister === undefined ||
		queryClient.isFetching() > 0
	) {
		return
	}

	const allUserIds = Array.from(
		new Set([
			...Array.from(userQueue).map((user) => user.id as string),
			...Array.from(stallQueue)
				.map((stall) => stall.pubkey)
				.filter(Boolean),
			...Array.from(productQueue)
				.map((product) => product.pubkey)
				.filter(Boolean),
		]),
	)

	let remainingUserIds = allUserIds

	while (remainingUserIds.length > 0) {
		remainingUserIds = await processBatch(remainingUserIds, allowRegister)
		if (remainingUserIds.length > 0) {
			await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY))
		}
	}

	clearQueues()
}

export async function checkIfOldProfile(userId: string, updatedAt?: number) {
	if (!updatedAt) return
	const elapsedTime = getElapsedTimeInDays(updatedAt)
	if (elapsedTime > 5) {
		const { userProfile: newUserProfile } = await fetchUserData(userId)
		if (newUserProfile && updatedAt > Number(newUserProfile.created_at)) {
			await handleUserNostrData(newUserProfile, userId)
		}
	}
}
