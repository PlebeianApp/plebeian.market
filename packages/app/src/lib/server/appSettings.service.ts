import { error } from '@sveltejs/kit'

import { APP_SETTINGS_META, appSettingsMeta, createId, db, eq } from '@plebeian/database'

import { getAppSettings } from './setup.service'

export type SettingsMeta = {
	id: string
	valueText: string
}

export let cachedPattern: RegExp | null = null

export const createForbiddenPattern = (words: SettingsMeta[]) => {
	const escapedWords = words.map((word) => word.valueText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
	console.log('computing forbidden pattern', escapedWords)
	const pattern = new RegExp(`(?:^|\\s)(${escapedWords.join('|')})(?:$|\\s|[^a-z])`, 'i')
	cachedPattern = pattern
	return pattern
}

export const getAllForbiddenWords = async (): Promise<{ forbiddenWords: SettingsMeta[]; forbiddenPattern: RegExp }> => {
	try {
		const results = await db
			.select({ valueText: appSettingsMeta.valueText, id: appSettingsMeta.id })
			.from(appSettingsMeta)
			.where(eq(appSettingsMeta.metaName, APP_SETTINGS_META.WORD_BLACKLIST.value))
			.execute()
		const forbiddenWords = results.filter((result): result is SettingsMeta => result.valueText !== null)
		return {
			forbiddenWords,
			forbiddenPattern: createForbiddenPattern(forbiddenWords),
		}
	} catch (e) {
		console.error(`Error getting forbidden words: ${e}`)
		error(500, `Failed to get forbidden words: ${e}`)
	}
}

export const disallowedString = async (text: string): Promise<string | null> => {
	const forbiddenWords = await getAllForbiddenWords()
	const lowercaseText = text.toLowerCase()
	const disallowedWord = forbiddenWords.find((word) => lowercaseText.includes(word.valueText.toLowerCase()))
	return disallowedWord?.valueText ?? null
}

export const addForbiddenWord = async (newWord: string): Promise<void> => {
	const instancePk = await getAppSettings()

	try {
		await db
			.insert(appSettingsMeta)
			.values({
				id: createId(),
				appId: instancePk.instancePk,
				metaName: APP_SETTINGS_META.WORD_BLACKLIST.value,
				valueText: newWord,
				valueBoolean: null,
				valueNumeric: null,
				key: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()
	} catch (e) {
		console.error(`Error adding forbidden word: ${e}`)
		error(500, `Failed to add forbidden word: ${e}`)
	}
}

export const deleteForbiddenWord = async (wordId: string): Promise<void> => {
	try {
		await db.delete(appSettingsMeta).where(eq(appSettingsMeta.id, wordId))
	} catch (e) {
		console.error(`Error deleting forbidden word: ${e}`)
		error(500, `Failed to delete forbidden word: ${e}`)
	}
}
