import type { NDKEvent, NostrEvent } from '@nostr-dev-kit/ndk'
import type { ExtendedBaseType, NDKEventStore } from '@nostr-dev-kit/ndk-svelte'
import { stallsFromNostrEvent } from '$lib/fetch/stalls.mutations'
import { get } from 'svelte/store'

import type { AppSettings } from '@plebeian/database'

import { stallsSub } from './subs'

class StallsPipeline {
	private processedIds: Set<string> = new Set()
	private batch: NDKEvent[] = []
	private timeoutId: ReturnType<typeof setTimeout> | undefined = undefined
	private isInserting: boolean = false
	private readonly threshold: number
	private readonly timeoutDelay: number
	private readonly maxBatchSize: number
	// private readonly dbInsertionLogic: () => Promise<void>;
	private readonly sub: NDKEventStore<ExtendedBaseType<NDKEvent>>
	private readonly appSettings: AppSettings

	constructor(
		sub: NDKEventStore<ExtendedBaseType<NDKEvent>>,
		appSettings: AppSettings,
		// dbInsertionLogic: () => Promise<void>,
		threshold: number = 20,
		timeoutDelay: number = 1000 * 15,
		maxBatchSize: number = 1000,
	) {
		this.sub = sub
		// this.dbInsertionLogic = dbInsertionLogic;
		this.threshold = threshold
		this.timeoutDelay = timeoutDelay
		this.maxBatchSize = maxBatchSize
		this.appSettings = appSettings
	}

	start() {
		if (this.appSettings.allowRegister) {
			this.sub.subscribe((events) => this.processEvents(events))
			console.log(`${JSON.stringify(this.sub.filters ? this.sub.filters[0].kinds : '')} Pipeline started`)
		} else {
			console.log('Registration its not allowed')
		}
	}

	private processEvents(events: NDKEvent[]) {
		try {
			const newEvents = this.filterEvents(events)
			this.addEventsToBatch(newEvents)
			this.scheduleInsertion()
		} catch (error) {
			console.error(`Error processing events: ${error}`)
		}
	}

	private filterEvents(events: NDKEvent[]) {
		return events.filter((event) => !this.processedIds.has(event.id))
	}

	private addEventsToBatch(events: NDKEvent[]) {
		const remainingCapacity = this.maxBatchSize - this.batch.length
		if (remainingCapacity <= 0) {
			console.log(`Batch is full, discarding excess events`)
			return
		}
		const eventsToAdd = events.slice(0, remainingCapacity)
		for (const event of eventsToAdd) {
			// TODO add logic to process
			this.processedIds.add(event.id)
			this.batch.push(event)
			if (this.batch.length >= this.threshold) {
				this.scheduleInsertion()
			}
		}
	}

	private scheduleInsertion() {
		if (this.batch.length >= this.threshold) {
			this.insertBatchIntoDatabase()
		} else if (this.batch.length > 0) {
			this.scheduleTimeout()
		}
	}

	private scheduleTimeout() {
		clearTimeout(this.timeoutId)
		this.timeoutId = setTimeout(() => {
			this.insertBatchIntoDatabase()
		}, this.timeoutDelay)
	}
	// TODO not working yet
	private async insertBatchIntoDatabase() {
		if (this.isInserting) return
		this.isInserting = true
		try {
			const stallsMutation = get(stallsFromNostrEvent)
			const productsToInsert = this.batch.slice(0, this.threshold)
			console.log('Formating', productsToInsert)
			const nostrEvents = await Promise.all(productsToInsert.map((event) => event.toNostrEvent()))
			console.log('mutating')
			const mutationResult = await stallsMutation.mutateAsync(nostrEvents)
			console.log('mutation done', mutationResult)
			this.batch = this.batch.filter((product) => !productsToInsert.includes(product))
			console.log('batch cleaned', this.batch.length)
		} catch (error) {
			console.error(`Error inserting batch into database: ${error}`)
		} finally {
			this.isInserting = false
		}
	}

	getState() {
		return {
			processedEvents: this.processedIds.size,
			batchLength: this.batch.length,
			isInserting: this.isInserting,
		}
	}

	enqueueEvents(events: NDKEvent[]) {
		this.processEvents(events)
	}

	clearBatch() {
		this.batch = []
	}

	resetPipeline() {
		this.processedIds.clear()
		this.batch = []
		this.timeoutId = undefined
		this.isInserting = false
	}
}

export default StallsPipeline
