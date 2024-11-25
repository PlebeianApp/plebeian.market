import type { NostrEvent } from '@nostr-dev-kit/ndk'
import type { EventCoordinates } from '$lib/interfaces'
import type { DisplayStall } from '$lib/server/stalls.service'
import { error } from '@sveltejs/kit'
import { createMutation } from '@tanstack/svelte-query'
import { goto } from '$app/navigation'
import ndkStore from '$lib/stores/ndk'
import { getEventCoordinates } from '$lib/utils'
import { get } from 'svelte/store'

import { createRequest, queryClient } from './client'
import { createCategoriesByFilterKey, createProductByFilterKey, createShippingKey, createStallsByFilterKey } from './keys'

declare module './client' {
	interface Endpoints {
		[k: `POST /api/v1/stalls/${string}`]: Operation<string, 'POST', never, NostrEvent, DisplayStall, never>
		[k: `PUT /api/v1/stalls/${string}`]: Operation<string, 'POST', never, NostrEvent, DisplayStall, never>
		[k: `DELETE /api/v1/stalls/${string}`]: Operation<string, 'DELETE', never, string, string, never>
		[k: `POST /api/v1/stalls/${string}/featured`]: Operation<string, 'POST', never, { featured: boolean }, { id: string }, never>
		[k: `POST /api/v1/stalls/${string}/ban`]: Operation<string, 'POST', never, { banned: boolean }, { id: string }, never>
	}
}

export const createStallFromNostrEvent = createMutation(
	{
		mutationFn: async (stallEvent: NostrEvent) => {
			const { coordinates } = getEventCoordinates(stallEvent) as EventCoordinates
			try {
				const response = await createRequest(`POST /api/v1/stalls/${coordinates}`, {
					body: stallEvent,
				})
				if (!response) {
					return null
				}
				return response
			} catch (e) {
				console.error(e)
				throw error(500, `Failed to mutate stall, ${e}`)
			}
		},

		onSuccess: (data: DisplayStall | null) => {
			if (data) {
				console.log('Stall inserted in db successfully', data)
				queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({ userId: data.userId }) })
				queryClient.invalidateQueries({ queryKey: createShippingKey(data.id) })
			}
		},
	},
	queryClient,
)

export const updateStallFromNostrEvent = createMutation(
	{
		mutationFn: async ([stallId, stallEvent]: [string, NostrEvent]) => {
			try {
				const response = await createRequest(`PUT /api/v1/stalls/${stallId}`, {
					body: stallEvent,
					auth: true,
				})
				if (!response) {
					return null
				}
				return response
			} catch (e) {
				console.error(e)
				throw error(500, `Failed to mutate stall, ${e}`)
			}
		},

		onSuccess: async (data: DisplayStall | null) => {
			if (data) {
				console.log('Stall inserted in db successfully', data)
				await queryClient.invalidateQueries({
					queryKey: createStallsByFilterKey({}),
				})
				await queryClient.invalidateQueries({
					queryKey: createShippingKey(data.id),
				})
			}
		},
	},
	queryClient,
)

export const setStallFeaturedMutation = createMutation(
	{
		mutationFn: async ({ stallId, featured }: { stallId: string; featured: boolean }) => {
			const response = await createRequest(`POST /api/v1/stalls/${stallId}/featured`, {
				body: { featured },
				auth: true,
			})
			return response
		},
		onSuccess: ({ id }: { id: string }) => {
			console.log('setStallFeaturedMutation', id)
			if (id) {
				queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({ stallId: id }) })
			}
		},
	},
	queryClient,
)

export const deleteStallMutation = createMutation(
	{
		mutationFn: async (stallId: string) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const res = await createRequest(`DELETE /api/v1/stalls/${stallId}`, {
					auth: true,
				})
				return res
			}
			return null
		},
		onSuccess: (stallId: string | null) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({ userId: $ndkStore.activeUser.pubkey }) })
				queryClient.invalidateQueries({
					queryKey: createProductByFilterKey({ userId: $ndkStore.activeUser.pubkey }),
				})
				queryClient.invalidateQueries({
					queryKey: createCategoriesByFilterKey({ userId: $ndkStore.activeUser.pubkey }),
				})
			}
		},
	},
	queryClient,
)

export const setStallBannedMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ stallId, banned }: { stallId: string; banned: boolean }) => {
			const response = await createRequest(`POST /api/v1/stalls/${stallId}/ban`, {
				body: { banned },
				auth: true,
			})
			return response
		},
		onSuccess: ({ id }: { id: string }) => {
			if (id) {
				queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({ stallId: id }) })
				queryClient.invalidateQueries({ queryKey: createStallsByFilterKey({}) })
				goto('/')
			}
		},
	},
	queryClient,
)
