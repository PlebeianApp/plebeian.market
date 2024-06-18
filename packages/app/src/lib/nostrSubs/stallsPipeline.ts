import type { NDKEvent } from '@nostr-dev-kit/ndk'
import { stallsSub } from '$lib/nostrSubs/subs'

const processedIds = new Set()
let batch: NDKEvent[] = []
let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined
const threshold = 25
const timeoutDelay = 1000 * 15
let isInserting = false

stallsSub.subscribe((events) => {
	const newEvent = events.filter((event) => !processedIds.has(event.id))
	for (const event of newEvent) {
		try {
			// TODO add logic to process
			processedIds.add(event.id)
			batch.push(event)
			if (batch.length >= threshold) {
				console.log('Batch lengh filled')
				insertStallsIntoDatabase()
			} else {
				clearTimeout(timeoutId)
				timeoutId = setTimeout(insertStallsIntoDatabase, timeoutDelay)
			}
		} catch (e) {
			console.error(e)
		}
	}
})

async function insertStallsIntoDatabase() {
	if (isInserting) return
	console.log('inserting in db', processedIds)
	isInserting = true
	if (batch.length > 0) {
		try {
			const productsToInsert = batch.slice(0, threshold)
			// TODO Insert in the db here
			batch = batch.filter((product) => !productsToInsert.includes(product))
			clearTimeout(timeoutId)
		} catch (error) {
			console.error(error)
		} finally {
			isInserting = false
		}
	}
}
