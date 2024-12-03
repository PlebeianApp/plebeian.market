import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { ExistsResult } from '$lib/interfaces'
import type { UsersFilter } from '$lib/schema'
import type { RichUser } from '$lib/server/users.service'
import { createQuery } from '@tanstack/svelte-query'
import { browser } from '$app/environment'
import { aggregatorAddUser, checkIfOldProfile } from '$lib/nostrSubs/data-aggregator'
import { fetchUserData, fetchUserRelays } from '$lib/nostrSubs/utils'
import { usersFilterSchema } from '$lib/schema'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import type { UserRoles } from '@plebeian/database'

import { createRequest, queryClient } from './client'
import { userKeys } from './query-key-factory'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/users/${string}`]: Operation<string, 'GET', never, never, RichUser | NDKUserProfile, never>
		[k: `GET /api/v1/users/${string}?exists`]: Operation<string, 'GET', never, never, ExistsResult, never>
		[k: `GET /api/v1/users/${string}/role`]: Operation<string, 'GET', never, never, UserRoles, never>
		'GET /api/v1/users': Operation<'/api/v1/users', 'GET', never, never, string[], UsersFilter>
	}
}

export const activeUserQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: userKeys.filtered({ userId: $ndkStore.activeUser?.pubkey }),
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = (await createRequest(`GET /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
				})) as RichUser
				return user
			}

			return null
		},
		enabled: !!$ndkStore.activeUser?.pubkey,
	})),
	queryClient,
)

export const createUserRoleByIdQuery = (id: string) =>
	createQuery<UserRoles>(
		{
			queryKey: userKeys.role(id),
			queryFn: async () => {
				const role = await createRequest(`GET /api/v1/users/${id}/role`, {
					auth: true,
				})
				return role
			},
		},
		queryClient,
	)

export const createUserByIdQuery = (id: string, nostrOnly = false, skipAggregator = false) =>
	createQuery<NDKUserProfile | null>(
		{
			queryKey: userKeys.filtered({ userId: id }),
			queryFn: async () => {
				try {
					if (!nostrOnly) {
						try {
							const result = (await createRequest(`GET /api/v1/users/${id}`, {})) as NDKUserProfile
							if (result?.updated_at) {
								checkIfOldProfile(id, Number(result.updated_at))
							}
							return result
						} catch {
							// Silently ignore
						}
					}

					const { userProfile: userData } = await fetchUserData(id)

					if (userData && !skipAggregator) {
						aggregatorAddUser(userData, id)
					}

					return userData ? userData : id ? { id } : null
				} catch (error) {
					console.error('Error fetching user profile:', error)
					return null
				}
			},
			enabled: !!id && !!browser,
		},
		queryClient,
	)

export const createUserRelaysByIdQuery = (id: string) =>
	createQuery(
		{
			queryKey: userKeys.relays(id),
			queryFn: async () => {
				const { userRelays } = await fetchUserRelays(id)
				if (userRelays) {
					return userRelays
				}
			},
			enabled: !!id,
		},
		queryClient,
	)

export const createUserExistsQuery = (id: string) =>
	createQuery<ExistsResult>(
		{
			queryKey: userKeys.exists(id),
			queryFn: async () => {
				const user = await createRequest(`GET /api/v1/users/${id}?exists`, {})
				return user
			},
			staleTime: Infinity,
		},
		queryClient,
	)

export const createUsersByFilterQuery = (filter: Partial<UsersFilter>) =>
	createQuery<string[]>(
		{
			queryKey: userKeys.filtered(filter),
			queryFn: async () => {
				const users = await createRequest(`GET /api/v1/users`, {
					params: usersFilterSchema.parse(filter),
					auth: true,
				})
				return users
			},
		},
		queryClient,
	)
