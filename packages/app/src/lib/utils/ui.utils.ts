import DOMPurify from 'dompurify'
import { marked } from 'marked'

export async function sanitizeAndParseContent(content: string) {
	let cleanContent = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
	cleanContent = await marked(cleanContent)

	return DOMPurify.sanitize(cleanContent, {
		ALLOWED_TAGS: ['p', 'a', 'img', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'],
		ALLOWED_ATTR: ['href', 'src', 'alt'],
	})
}
