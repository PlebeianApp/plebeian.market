export function getMediaType(url: string | null): 'image' | 'video' | null {
	if (!url) return null
	try {
		const extension = url.split('.').pop()?.toLowerCase()
		if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) return 'video'
		if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image'
		return null
	} catch {
		return null
	}
}
