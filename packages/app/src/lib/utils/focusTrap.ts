export function focusTrap(node: HTMLElement, enabled = true) {
	const FOCUSABLE = ['a[href]', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]']
		.map((s) => `${s}:not([tabindex="-1"])`)
		.join(',')

	let first: HTMLElement | null = null
	let last: HTMLElement | null = null

	const handleTrap = (e: KeyboardEvent, isFirst: boolean) => {
		if (e.key === 'Tab' && ((isFirst && e.shiftKey) || (!isFirst && !e.shiftKey))) {
			e.preventDefault()
			;(isFirst ? last : first)?.focus()
		}
	}

	const setup = (fromObserver = false) => {
		if (!enabled) return

		const elements = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
			.filter((el) => el.tabIndex >= 0)
			.sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity))

		if (!elements.length) return
		;[first, last] = [elements[0], elements[elements.length - 1]]
		first.addEventListener('keydown', (e) => handleTrap(e, true))
		last.addEventListener('keydown', (e) => handleTrap(e, false))

		if (!fromObserver) {
			;(node.querySelector<HTMLElement>('[data-focusindex]') || first)?.focus()
		}
	}

	const cleanup = () => {
		first?.removeEventListener('keydown', (e) => handleTrap(e, true))
		last?.removeEventListener('keydown', (e) => handleTrap(e, false))
	}

	setup()
	const observer = new MutationObserver(() => setup(true))
	observer.observe(node, { childList: true, subtree: true })

	return {
		update: (newEnabled: boolean) => {
			enabled = newEnabled
			newEnabled ? setup() : cleanup()
		},
		destroy: () => {
			cleanup()
			observer.disconnect()
		},
	}
}
