import type { PageServerLoad } from './$types'

export interface ProductCheck {
	id: string
	identifier?: string
	exist: boolean
}

export const load: PageServerLoad = async ({ params }) => {
	return {
		roadmap: {
			id: params.nodeId,
		},
	}
}
