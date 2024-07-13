import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { UsersFilter } from '$lib/schema'
import type { RichUser } from '$lib/server/users.service'
import { createQuery } from '@tanstack/svelte-query'
import { invalidateAll } from '$app/navigation'
import { usersFilterSchema } from '$lib/schema'
import ndkStore from '$lib/stores/ndk'
import { derived } from 'svelte/store'

import type { UserMeta } from '@plebeian/database'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `GET /api/v1/users/${string}`]: Operation<string, 'GET', never, never, RichUser | NDKUserProfile, never>
		[k: `GET /api/v1/users/${string}?exists`]: Operation<string, 'GET', never, never, boolean, never>
		'GET /api/v1/users': Operation<'/api/v1/users', 'GET', never, never, UserMeta[], UsersFilter>
	}
}

export const activeUserQuery = createQuery(
	derived(ndkStore, ($ndkStore) => ({
		queryKey: ['user', $ndkStore.activeUser?.pubkey],
		queryFn: async () => {
			if ($ndkStore.activeUser?.pubkey) {
				const user = (await createRequest(`GET /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
				})) as RichUser
				invalidateAll()
				return user
			}

			return null
		},
		enabled: !!$ndkStore.activeUser?.pubkey,
	})),
	queryClient,
)

export const createUserByIdQuery = (id: string) =>
	createQuery<NDKUserProfile>(
		{
			queryKey: ['users', id],
			queryFn: async () => {
				const user = (await createRequest(`GET /api/v1/users/${id}`, {})) as NDKUserProfile
				return user
			},
			enabled: !!id,
		},
		queryClient,
	)

export const createUserExistsQuery = (id: string) =>
	createQuery<boolean>(
		{
			queryKey: ['users', 'exists', id],
			queryFn: async () => {
				const user = await createRequest(`GET /api/v1/users/${id}?exists`, {})
				return user
			},
			staleTime: Infinity,
		},
		queryClient,
	)

export const createUsersByRoleQuery = (filter: Partial<UsersFilter>) =>
	createQuery<UserMeta[]>(
		{
			queryKey: ['users', ...Object.values(filter)],
			queryFn: async () => {
				console.log(filter, 'filter')
				const user = await createRequest(`GET /api/v1/users`, {
					params: usersFilterSchema.parse(filter),
					auth: true,
				})
				return user
			},
		},
		queryClient,
	)
