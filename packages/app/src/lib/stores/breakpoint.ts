import { readable } from 'svelte/store'

export type Breakpoint = 'sm' | 'md' | 'lg'

export const breakpoint = readable<Breakpoint>('lg', (set) => {
	if (typeof window === 'undefined') return

	const small = window.matchMedia('(max-width: 639px)')
	const medium = window.matchMedia('(min-width: 640px) and (max-width: 1023px)')
	const large = window.matchMedia('(min-width: 1024px)')

	function setBreakpoint() {
		if (small.matches) set('sm')
		else if (medium.matches) set('md')
		else if (large.matches) set('lg')
	}

	setBreakpoint()

	small.addEventListener('change', setBreakpoint)
	medium.addEventListener('change', setBreakpoint)
	large.addEventListener('change', setBreakpoint)

	return () => {
		small.removeEventListener('change', setBreakpoint)
		medium.removeEventListener('change', setBreakpoint)
		large.removeEventListener('change', setBreakpoint)
	}
})
