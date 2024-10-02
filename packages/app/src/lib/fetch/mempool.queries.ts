// mempool.queries.ts
import { createQuery } from '@tanstack/svelte-query'

import { queryClient } from './client'

interface MempoolTransaction {
	txid: string
	version: number
	locktime: number
	vin: unknown[]
	vout: unknown[]
	size: number
	weight: number
	fee: number
	status: {
		confirmed: boolean
		block_height?: number
		block_hash?: string
		block_time?: number
	}
}

const MEMPOOL_API_BASE = 'https://mempool.space/api'

export const createMempoolAddressTransactionsQuery = (address: string, amountSats: number) =>
	createQuery<MempoolTransaction[]>(
		{
			queryKey: ['mempoolAddressTransactions', address],
			queryFn: async () => {
				console.log(address)
				const response = await fetch(`${MEMPOOL_API_BASE}/address/${address}/txs`)
				if (!response.ok) {
					throw new Error('Failed to fetch address transactions')
				}

				return await response.json()
			},

			refetchInterval: (q) => (q.state.data?.length ? false : 60000),
			select: (data) => {
				return data.filter((tx) => tx.vout.some((output) => output.value === amountSats && output.scriptpubkey_address === address))
			},
		},
		queryClient,
	)
