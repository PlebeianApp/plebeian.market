import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk'
import { checkIfUserExists, getElapsedTimeInDays, getEventCoordinates, shouldRegister } from '$lib/utils'

import { fetchUserData, handleProductNostrData, handleStallNostrData, handleUserNostrData } from './utils'

class DataAggregator {
	private userQueue: Set<NDKUserProfile> = new Set()
	private stallQueue: Set<NDKEvent> = new Set()
	private productQueue: Set<NDKEvent> = new Set()

	addUser(user: NDKUserProfile, userId: string) {
		user.id = userId
		this.userQueue.add(user)
	}

	addStall(stall: NDKEvent) {
		this.stallQueue.add(stall)
	}

	addProduct(product: NDKEvent) {
		this.productQueue.add(product)
	}

	addProducts(products: Set<NDKEvent>) {
		for (const product of products) {
			this.productQueue.add(product)
		}
	}

	getUserQueue(): Set<NDKUserProfile> {
		return this.userQueue
	}

	getStallQueue(): Set<NDKEvent> {
		return this.stallQueue
	}

	getProductQueue(): Set<NDKEvent> {
		return this.productQueue
	}

	clear() {
		this.userQueue.clear()
		this.stallQueue.clear()
		this.productQueue.clear()
	}
}

export const dataAggregator = new DataAggregator()

export async function processQueuedInsertions(allowRegister?: boolean) {
	const userQueue = dataAggregator.getUserQueue()
	const stallQueue = dataAggregator.getStallQueue()
	const productQueue = dataAggregator.getProductQueue()
	if (allowRegister == undefined || !userQueue.size || !stallQueue.size || !productQueue.size) return
	const allUserIds = new Set([
		...Array.from(userQueue).map((user) => user.id as string),
		...Array.from(stallQueue)
			.map((stall) => stall.pubkey)
			.filter(Boolean),
		...Array.from(productQueue)
			.map((product) => product.pubkey)
			.filter(Boolean),
	])

	console.log('Looking all user Ids', allUserIds)
	for (const userId of allUserIds) {
		const userExists = await checkIfUserExists(userId)
		const shouldRegisterUser = await shouldRegister(allowRegister, userExists, userId)
		console.log('looking if userExist and if should register', userExists, shouldRegisterUser)

		if (shouldRegisterUser) {
			const user = Array.from(userQueue).find((u) => u.id === userId)
			const userStalls = Array.from(stallQueue).filter((stall) => getEventCoordinates(stall)?.pubkey === userId)
			const userProducts = new Set(Array.from(productQueue).filter((product) => getEventCoordinates(product)?.pubkey === userId))

			if (user && !userExists) {
				await handleUserNostrData(user, userId)
			}

			if (userProducts.size > 0 && userStalls) {
				for (const stall of userStalls) {
					await handleStallNostrData(stall)
				}
				try {
					await handleProductNostrData(userProducts)
				} catch {
					console.warn('Cannot insert products')
				}
			}
		}
	}

	dataAggregator.clear()
}

export async function checkIfOldProfile(userId: string, updatedAt?: number) {
	if (!updatedAt) return
	const elapsedTime = getElapsedTimeInDays(updatedAt)
	if (elapsedTime > 5) {
		const { userProfile: newUserProfile } = await fetchUserData(userId)
		if (newUserProfile) {
			await handleUserNostrData(newUserProfile, userId)
		}
	}
}
