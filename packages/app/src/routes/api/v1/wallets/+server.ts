import { error, json } from '@sveltejs/kit'
import { authorize, authorizeUserless } from '$lib/auth'
import { deleteWalletForUser, getWalletsByUserId, postWalletForUser, updateWalletForUser } from '$lib/server/wallet.service'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ request, url: { searchParams } }) => {
	const userId = searchParams.get('userId')

	if (!userId) {
		throw error(400, 'Invalid request')
	}

	try {
		await authorize(request, userId, 'GET')
		const wallets = await getWalletsByUserId(userId)
		return json(wallets)
	} catch (e: unknown) {
		console.error(e)
		throw error(500, e as Error)
	}
}

export const POST: RequestHandler = async ({ request, url: { searchParams } }) => {
	const userId = searchParams.get('userId')
	if (!userId) {
		throw error(400, 'Invalid request')
	}

	try {
		await authorize(request, userId, 'POST')
		const { walletType, walletDetails } = await request.json()
		const newWallet = await postWalletForUser(walletType, userId, walletDetails)
		return json(newWallet)
	} catch (e: unknown) {
		console.error(e)
		throw error(500, e as Error)
	}
}

export const PUT: RequestHandler = async ({ request, url: { searchParams } }) => {
	const userId = searchParams.get('userId')
	const walletId = searchParams.get('walletId')

	if (!userId || !walletId) {
		throw error(400, 'Invalid request')
	}

	try {
		await authorize(request, userId, 'PUT')
		const wallet = await request.json()
		const updatedWallet = await updateWalletForUser(walletId, userId, wallet.walletDetails)
		return json(updatedWallet)
	} catch (e: unknown) {
		console.error(e)
		throw error(500, e as Error)
	}
}

export const DELETE: RequestHandler = async ({ request, url: { searchParams } }) => {
	const walletId = searchParams.get('walletId')

	if (!walletId) {
		throw error(400, 'Invalid request')
	}

	try {
		const userId = await authorizeUserless(request, 'DELETE')
		const deletedWallet = await deleteWalletForUser(walletId, userId)
		return json(deletedWallet)
	} catch (e: unknown) {
		console.error(e)
		throw error(500, e as Error)
	}
}
