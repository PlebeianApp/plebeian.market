import { error, json } from '@sveltejs/kit'
import { authorizeAdmin } from '$lib/auth'
import { addForbiddenWord, deleteForbiddenWord, getAllForbiddenWords } from '$lib/server/appSettings.service'

export async function GET({ request }) {
	try {
		await authorizeAdmin(request, 'GET')
		const forbiddenWords = await getAllForbiddenWords()
		return json(forbiddenWords)
	} catch (e) {
		console.error(e)
		error(500, JSON.stringify(e))
	}
}

export async function POST({ request }) {
	const { word } = await request.json()

	if (!word) {
		error(400, 'Invalid request')
	}

	try {
		await authorizeAdmin(request, 'POST')
		await addForbiddenWord(word)
		return json({ success: true })
	} catch (e) {
		console.error(e)
		error(500, JSON.stringify(e))
	}
}

export async function DELETE({ request }) {
	const { wordId } = await request.json()

	if (!wordId) {
		error(400, 'Invalid request')
	}

	try {
		await authorizeAdmin(request, 'DELETE')
		await deleteForbiddenWord(wordId)
		return json({ success: true })
	} catch (e) {
		console.error(e)
		error(500, JSON.stringify(e))
	}
}
