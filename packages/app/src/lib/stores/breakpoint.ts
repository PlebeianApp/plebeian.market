import { readable } from 'svelte/store'

export type Breakpoint = 'sm' | 'md' | 'lg'

export const breakpoint = readable<Breakpoint>('lg', (set) => {
	if (typeof window === 'undefined') return

	const queries = [
		{ query: '(max-width: 639px)', value: 'sm' },
		{ query: '(min-width: 640px) and (max-width: 1023px)', value: 'md' },
		{ query: '(min-width: 1024px)', value: 'lg' },
	] as const

	const mediaQueries = queries.map(({ query, value }) => ({
		mql: window.matchMedia(query),
		value,
	}))

	function setBreakpoint() {
		const match = mediaQueries.find(({ mql }) => mql.matches)
		if (match) set(match.value as Breakpoint)
	}

	setBreakpoint()
	mediaQueries.forEach(({ mql }) => mql.addEventListener('change', setBreakpoint))

	return () => {
		mediaQueries.forEach(({ mql }) => mql.removeEventListener('change', setBreakpoint))
	}
})
