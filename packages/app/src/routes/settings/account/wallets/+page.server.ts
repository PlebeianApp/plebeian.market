import type { WalletType } from '@plebeian/database'
import { WALLET_TYPE } from '@plebeian/database'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	return { WalletTypes: Object.values(WALLET_TYPE) as unknown as WalletType }
}
