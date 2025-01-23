import { derived, readable } from 'svelte/store'

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

const MOBILE_SIZE_CLASSES = {
	default: 'h-11 px-4 text-base',
	sm: 'h-11 px-3 text-base',
	lg: 'h-12 px-6 text-lg',
	icon: 'h-11 w-11',
	none: 'h-6 w-fit',
} as const

export const responsiveButtonClasses = derived(breakpoint, ($breakpoint) => ($breakpoint === 'sm' ? MOBILE_SIZE_CLASSES : null))
