import type { ExtendedAppSettings } from '$lib/server/setup.service'
import { initialSetupDataSchema } from '$lib/schema'
import { createNcryptSec } from '$lib/utils'
import { npubEncode } from 'nostr-tools/nip19'
import { ofetch } from 'ofetch'

export function processAppSettings(data: Record<string, unknown>, isSetup: boolean, instancePass?: string): Partial<ExtendedAppSettings> {
	const processedData: Partial<ExtendedAppSettings> = {
		...data,
		ownerPk: (data.ownerPk || undefined) as string | undefined,
		allowRegister: data.allowRegister === true,
		adminsList: data.adminsList ? data.adminsList.toString().split(',') : undefined,
		logoUrl: (data.logoUrl === '' ? undefined : data.logoUrl) as string | undefined,
		contactEmail: (data.contactEmail === '' ? null : data.contactEmail) as string | null | undefined,
		defaultCurrency: data.defaultCurrency as string | undefined,
	}

	if (isSetup && instancePass && data.instanceSk) {
		processedData.instanceSk = createNcryptSec(data.instanceSk as string, instancePass).ncryptsec
	} else if (!isSetup && data.instancePk) {
		processedData.instancePk = npubEncode(data.instancePk)
	}

	return Object.fromEntries(Object.entries(processedData).filter(([_, v]) => v !== undefined)) as Partial<ExtendedAppSettings>
}

export async function submitAppSettings(data: Partial<ExtendedAppSettings>, isSetup: boolean) {
	const endpoint = isSetup ? '/setup' : '/dash/settings/app/misc'
	const schema = isSetup ? initialSetupDataSchema : initialSetupDataSchema.partial()
	const parsedData = schema.safeParse(data)

	if (!parsedData.success) {
		throw parsedData.error
	}

	return await ofetch(endpoint, {
		method: isSetup ? 'POST' : 'PUT',
		body: parsedData.data,
	})
}
