import { createQuery } from '@tanstack/svelte-query'

import { queryClient } from './client'
import { paymentKeys } from './query-key-factory'

interface MempoolTransaction {
	txid: string
	version: number
	locktime: number
	vin: Vin[]
	vout: Vout[]
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

interface Vin {
	txid: string
	vout: number
	prevout: {
		scriptpubkey: string
		scriptpubkey_asm: string
		scriptpubkey_type: string
		scriptpubkey_address: string
		value: number
	}
	scriptsig: string
	scriptsig_asm: string
	witness: string[]
	is_coinbase: boolean
	sequence: number
	inner_witnessscript_asm: string
}

interface Vout {
	scriptpubkey: string
	scriptpubkey_asm: string
	scriptpubkey_type: string
	scriptpubkey_address: string
	value: number
}

const MEMPOOL_API_BASE = 'https://mempool.space/api'

export const createMempoolAddressTransactionsQuery = (address: string, amountSats: number) =>
	createQuery<MempoolTransaction[]>(
		{
			queryKey: paymentKeys.mempool.transactions(address),
			queryFn: async () => {
				const response = await fetch(`${MEMPOOL_API_BASE}/address/${address}/txs`)
				if (!response.ok) {
					throw new Error('Failed to fetch address transactions')
				}

				return await response.json()
			},

			refetchInterval: (q) => {
				if (q.state.dataUpdateCount < 60) return q.state.data?.length ? false : 60000
				else return false
			},
			select: (data) => {
				return data.filter((tx) => tx.vout.some((output) => output.value === amountSats && output.scriptpubkey_address === address))
			},
		},
		queryClient,
	)
