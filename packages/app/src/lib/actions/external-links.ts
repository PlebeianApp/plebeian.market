// src/lib/actions/external-links.ts
type ExternalLinkOptions = {
	target?: string
	rel?: string
	excludeClasses?: string[]
	urlPattern?: RegExp
}

export function externalLinks(node: HTMLElement, options: ExternalLinkOptions = {}) {
	const {
		target = '_blank',
		rel = 'noopener noreferrer',
		excludeClasses = ['no-external'],
		urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi,
	} = options

	function isExcluded(element: HTMLElement): boolean {
		return excludeClasses.some((cls) => element.classList.contains(cls))
	}

	function processTextContent(text: string): DocumentFragment | null {
		const matches = text.match(urlPattern)
		if (!matches) return null

		const fragment = document.createDocumentFragment()
		let lastIndex = 0

		matches.forEach((match) => {
			const startIndex = text.indexOf(match, lastIndex)

			// Add text before the URL
			if (startIndex > lastIndex) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex, startIndex)))
			}

			// Create link element
			const link = document.createElement('a')
			link.href = match
			link.textContent = match
			link.setAttribute('target', target)
			link.setAttribute('rel', rel)
			link.classList.add('external-link')

			fragment.appendChild(link)
			lastIndex = startIndex + match.length
		})

		// Add remaining text
		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
		}

		return fragment
	}

	function processElement(element: HTMLElement) {
		// Skip if element has excluded class
		if (isExcluded(element)) return

		// Process existing links
		if (element.tagName === 'A') {
			const href = element.getAttribute('href')
			if (!href) return

			try {
				const url = new URL(href, window.location.origin)
				if (url.origin !== window.location.origin) {
					element.setAttribute('target', target)
					element.setAttribute('rel', rel)
					element.classList.add('external-link')
				}
			} catch (e) {
				// Invalid URL, skip
				return
			}
			return
		}

		// Skip script and style tags
		if (['SCRIPT', 'STYLE'].includes(element.tagName)) return

		// Process child nodes
		const childNodes = Array.from(element.childNodes)
		childNodes.forEach((child) => {
			if (child.nodeType === Node.TEXT_NODE) {
				const fragment = processTextContent(child.textContent || '')
				if (fragment) {
					child.replaceWith(fragment)
				}
			} else if (child.nodeType === Node.ELEMENT_NODE) {
				processElement(child as HTMLElement)
			}
		})
	}

	function update() {
		processElement(node)
	}

	// Initial processing
	update()

	// Setup observer for dynamic content
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			// Handle added nodes
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					processElement(node as HTMLElement)
				}
			})

			// Handle character data changes
			if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
				const fragment = processTextContent(mutation.target.textContent || '')
				if (fragment) {
					;(mutation.target as Text).replaceWith(fragment)
				}
			}
		})
	})

	observer.observe(node, {
		childList: true,
		subtree: true,
		characterData: true,
	})

	return {
		update(newOptions: ExternalLinkOptions = {}) {
			Object.assign(options, newOptions)
			update()
		},
		destroy() {
			observer.disconnect()
		},
	}
}
