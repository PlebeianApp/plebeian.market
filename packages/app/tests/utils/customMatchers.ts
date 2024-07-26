import { expect } from 'vitest'

expect.extend({
	toBeVisible: async (element: unknown) => {
		const isVisible = await element.isVisible()
		return {
			pass: isVisible,
			message: () => `expected element to ${isVisible ? 'not be' : 'be'} visible`,
		}
	},
	toHaveInputValue: async (page: unknown, selector: string, expectedValue: string) => {
		const actualValue = await page.inputValue(selector)
		return {
			pass: actualValue === expectedValue,
			message: () => `expected input ${selector} to have value "${expectedValue}", but got "${actualValue}"`,
		}
	},
})
