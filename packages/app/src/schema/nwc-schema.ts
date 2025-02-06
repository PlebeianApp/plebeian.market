import { isValidHexKey } from '$lib/utils/validation.utils'
import { z } from 'zod'

export const nwcSchema = z.object({
	walletPubKey: z
		.string()
		.min(1, 'Wallet pubkey is required')
		.refine((val) => isValidHexKey(val), { message: 'Invalid wallet pubkey format' }),
	walletRelays: z
		.string()
		.min(1, 'At least one relay is required')
		.refine(
			(val) => {
				const relays = val
					.split(',')
					.map((r) => r.trim())
					.filter(Boolean)
				return relays.every((relay) => relay.startsWith('wss://'))
			},
			{ message: 'Relays must be valid WebSocket URLs starting with wss://' },
		),
	walletSecret: z.string().min(1, 'Wallet secret is required'),
})

export type NwcForm = z.infer<typeof nwcSchema>
