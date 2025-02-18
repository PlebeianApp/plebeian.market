import type { NDKUserProfile } from '@nostr-dev-kit/ndk'
import { npubEncode } from 'nostr-tools/nip19'

export const getProfileName = (userProfile: NDKUserProfile | null, pubkey: string) =>
	userProfile?.name || userProfile?.displayName || npubEncode(pubkey).slice(0, 12) || pubkey.slice(0, 12)
