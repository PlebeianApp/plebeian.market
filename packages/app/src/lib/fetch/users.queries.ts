import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { UsersFilter } from '$lib/schema'
import type { RichUser } from '$lib/server/users.service'
import { createQuery } from '@tanstack/svelte-query'
import { invalidateAll } from '$app/navigation'
import { fetchUserData, handleUserNostrData } from '$lib/nostrSubs/utils'
import { usersFilterSchema } from '$lib/schema'
import ndkStore from '$lib/stores/ndk'
import { shouldRegister } from '$lib/utils'
import { ofetch } from 'ofetch'
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

// export const createUserByIdQuery = (id: string) =>
// 	createQuery<NDKUserProfile | null>(
// 		{
// 			queryKey: ['users', id],
// 			queryFn: async () => {
// 				try {
// 					const user = (await createRequest(`GET /api/v1/users/${id}`, {})) as NDKUserProfile
// 					return user
// 				} catch (e) {
// 					const { userProfile: userData } = await fetchUserData(id)
// 					if (userData) return userData
// 					return null
// 				}
// 			},
// 			enabled: !!id,
// 		},
// 		queryClient,
// 	)
export const createUserByIdQuery = (id: string) =>
	createQuery<NDKUserProfile | null>(
		{
			queryKey: ['users', id],
			queryFn: async () => {
				try {
					const user = (await createRequest(`GET /api/v1/users/${id}`, {})) as NDKUserProfile
					return user
				} catch (error) {
					const { userProfile: userData } = await fetchUserData(id)
					if (userData) {
						// console.log("Looking the userData",userData)
						// const shouldReg = await shouldRegister(allowRegister, userExists, id);
						// if (shouldReg) {
						//   await handleUserNostrData(userData, id);
						// }
						return userData
					} else if (!userData && id) {
						// console.log("Seems that there is not that data",userData)
						// const shouldReg = await shouldRegister(allowRegister, userExists, id);
						// if (shouldReg) {
						//   await ofetch('/p', { method: 'POST', body: { userId: id } });
						//   console.log('Null user registered successfully', id);
						// }
						return { id }
					}
					return null
				}
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
