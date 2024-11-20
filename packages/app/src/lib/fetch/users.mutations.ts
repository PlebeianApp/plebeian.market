import type { NDKUser, NDKUserProfile } from '@nostr-dev-kit/ndk'
import type { RichUser } from '$lib/server/users.service'
import { createMutation } from '@tanstack/svelte-query'
import { goto } from '$app/navigation'
import ndkStore from '$lib/stores/ndk'
import { deleteAccount } from '$lib/stores/session'
import { get } from 'svelte/store'

import type { User } from '@plebeian/database'
import type { UserRoles } from '@plebeian/database/constants'
import { USER_ROLES } from '@plebeian/database/constants'

import { createRequest, queryClient } from './client'

declare module './client' {
	interface Endpoints {
		[k: `PUT /api/v1/users/${string}`]: Operation<string, 'PUT', never, Partial<RichUser> | NDKUserProfile, User, never>
		[k: `PUT /api/v1/users/${string}/role`]: Operation<
			string,
			'PUT',
			never,
			{ role: UserRoles; userId: string } | NDKUserProfile,
			User,
			never
		>
		'POST /api/v1/users': Operation<string, 'POST', never, { id: string } & NDKUser['profile'], User, never>
		[k: `DELETE /api/v1/users/${string}`]: Operation<string, 'DELETE', never, never, boolean, never>
		[k: `POST /api/v1/users/${string}`]: Operation<string, 'POST', never, NDKUserProfile, User, never>
		[k: `POST /api/v1/users/${string}/ban`]: Operation<string, 'POST', never, { banned: boolean }, { id: string }, never>
	}
}

export const userDataMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async (profile: Partial<RichUser>) => {
			const $ndkStore = get(ndkStore)

			if ($ndkStore.activeUser?.pubkey) {
				const user = await createRequest(`PUT /api/v1/users/${$ndkStore.activeUser.pubkey}`, {
					auth: true,
					body: profile,
				})
				return user
			}
			return null
		},
		onSuccess: (data: User | null) => {
			const $ndkStore = get(ndkStore)
			queryClient.invalidateQueries({ queryKey: ['user', $ndkStore.activeUser?.pubkey] })
			queryClient.setQueryData(['user', $ndkStore.activeUser?.pubkey], data)
		},
	},
	queryClient,
)

export const setUserRoleMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ userId, role }: { userId: string; role: UserRoles }) => {
			const user = await createRequest(`PUT /api/v1/users/${userId}/role`, {
				auth: true,
				body: { role },
			})
			return user
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users', ...Object.values({ role: USER_ROLES.ADMIN })] })
			queryClient.invalidateQueries({ queryKey: ['users', ...Object.values({ role: USER_ROLES.EDITOR })] })
			queryClient.invalidateQueries({ queryKey: ['users', ...Object.values({ role: USER_ROLES.PLEB })] })
		},
	},
	queryClient,
)

export const userDeleteAccountMutation = createMutation(
	{
		mutationFn: async (userId?: string) => {
			const $ndkStore = get(ndkStore)
			if ($ndkStore.activeUser?.pubkey) {
				const id = userId ?? $ndkStore.activeUser.pubkey
				const deleted = await createRequest(`DELETE /api/v1/users/${id}`, {
					auth: true,
				})
				return deleted
			}
			return null
		},
		onSuccess: () => {
			const $ndkStore = get(ndkStore)
			deleteAccount($ndkStore.activeUser?.pubkey ? $ndkStore.activeUser?.pubkey : '')
			delete $ndkStore.signer
			goto('/')
		},
	},
	queryClient,
)

export const createUserFromNostrMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ profile, pubkey }: { profile: NDKUserProfile; pubkey: string }) => {
			const user = await createRequest(`POST /api/v1/users/${pubkey}`, {
				body: profile,
			})
			return user
		},
		onSuccess: (data: User | null) => {
			console.log('User registered sucesfully', data)
			queryClient.setQueryData(['user', data?.id], data)
		},
	},
	queryClient,
)

export const updateUserFromNostrMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ profile, pubkey }: { profile: NDKUserProfile | null; pubkey: string }) => {
			if (profile) {
				const user = await createRequest(`PUT /api/v1/users/${pubkey}`, {
					body: profile,
					auth: true,
				})
				return user
			}
			return null
		},
		onSuccess: (data: User | null) => {
			queryClient.invalidateQueries({ queryKey: ['users', data?.id] })
			queryClient.setQueryData(['users', data?.id], data)
		},
	},
	queryClient,
)

export const setUserBannedMutation = createMutation(
	{
		mutationKey: [],
		mutationFn: async ({ userId, banned }: { userId: string; banned: boolean }) => {
			const response = await createRequest(`POST /api/v1/users/${userId}/ban`, {
				body: { banned },
				auth: true,
			})
			return response
		},
		onSuccess: ({ id }: { id: string }) => {
			if (id) {
				queryClient.invalidateQueries({ queryKey: ['users', id] })
				queryClient.invalidateQueries({ queryKey: ['users'] })
				goto('/')
			}
		},
	},
	queryClient,
)
