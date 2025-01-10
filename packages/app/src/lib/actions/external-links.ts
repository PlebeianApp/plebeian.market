type ExternalLinkOptions = {
	target?: string
	rel?: string
	excludeClasses?: string[]
	urlPattern?: RegExp
}

const DEFAULT_URL_PATTERN = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi

let urlCache = new WeakMap<HTMLElement, boolean>()

export function externalLinks(node: HTMLElement, options: ExternalLinkOptions = {}) {
	const { target = '_blank', rel = 'noopener noreferrer', excludeClasses = ['no-external'], urlPattern = DEFAULT_URL_PATTERN } = options

	function isExcluded(element: HTMLElement): boolean {
		for (let i = 0; i < excludeClasses.length; i++) {
			if (element.classList.contains(excludeClasses[i])) return true
		}
		return false
	}

	function isExternalUrl(element: HTMLElement): boolean {
		if (urlCache.has(element)) {
			return urlCache.get(element)!
		}

		const href = element.getAttribute('href')
		if (!href) return false

		try {
			const url = new URL(href, window.location.origin)
			const isExternal = url.origin !== window.location.origin
			urlCache.set(element, isExternal)
			return isExternal
		} catch {
			return false
		}
	}

	function processTextContent(text: string): DocumentFragment | null {
		const matches = text.match(urlPattern)
		if (!matches) return null

		const fragment = document.createDocumentFragment()
		let lastIndex = 0

		for (let i = 0; i < matches.length; i++) {
			const match = matches[i]
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
		}

		// Add remaining text
		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
		}

		return fragment
	}

	function processElement(element: HTMLElement) {
		if (isExcluded(element)) return

		if (element.tagName === 'A') {
			if (isExternalUrl(element)) {
				element.setAttribute('target', target)
				element.setAttribute('rel', rel)
				element.classList.add('external-link')
			}
			return
		}

		if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return

		const childNodes = element.childNodes
		for (let i = 0; i < childNodes.length; i++) {
			const child = childNodes[i]
			if (child.nodeType === Node.TEXT_NODE) {
				const fragment = processTextContent(child.textContent || '')
				if (fragment) {
					child.replaceWith(fragment)
				}
			} else if (child.nodeType === Node.ELEMENT_NODE) {
				processElement(child as HTMLElement)
			}
		}
	}

	let updateScheduled = false
	function scheduleUpdate() {
		if (!updateScheduled) {
			updateScheduled = true
			requestAnimationFrame(() => {
				processElement(node)
				updateScheduled = false
			})
		}
	}

	scheduleUpdate()

	const observer = new MutationObserver((mutations) => {
		let shouldUpdate = false

		for (let i = 0; i < mutations.length; i++) {
			const mutation = mutations[i]

			const nodes = mutation.addedNodes
			for (let j = 0; j < nodes.length; j++) {
				const node = nodes[j]
				if (node.nodeType === Node.ELEMENT_NODE) {
					shouldUpdate = true
					break
				}
			}

			if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
				const fragment = processTextContent(mutation.target.textContent || '')
				if (fragment) {
					;(mutation.target as Text).replaceWith(fragment)
				}
			}

			if (shouldUpdate) break
		}

		if (shouldUpdate) {
			scheduleUpdate()
		}
	})

	observer.observe(node, {
		childList: true,
		subtree: true,
		characterData: true,
	})

	return {
		update(newOptions: ExternalLinkOptions = {}) {
			Object.assign(options, newOptions)
			urlCache = new WeakMap<HTMLElement, boolean>()
			scheduleUpdate()
		},
		destroy() {
			observer.disconnect()
			urlCache = new WeakMap<HTMLElement, boolean>()
		},
	}
}
