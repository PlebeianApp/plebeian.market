import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { opts } from './globalSetup'
import { login, retryClick, waitForSelectorWithLogging } from './utils/testUtils'

describe(
	'settings',
	{
		sequential: true,
	},
	async () => {
		let browser: Browser
		let page: Page

		beforeAll(async () => {
			browser = await chromium.launch(opts)
			page = await browser.newPage()
			page.setDefaultTimeout(50000)
		})

		afterAll(async () => {
			await browser?.close()
		})

		beforeEach(async () => {
			const url = `http://${process.env.APP_HOST}:${process.env.APP_PORT}/`
			await page.goto(url)
		})

		it('should navigate to user settings and submit the form', async () => {
			await login(page)

			await waitForSelectorWithLogging(page, '#menuButton', 'menu button')
			await retryClick(page, '#menuButton')

			await waitForSelectorWithLogging(page, 'text=Settings', 'settings option')
			await retryClick(page, 'text=Settings')

			await waitForSelectorWithLogging(page, 'h2>a[href="/settings"]', 'settings page header')

			await waitForSelectorWithLogging(page, 'text=Profile', 'profile section')
			await retryClick(page, 'text=Profile')

			const formFields = {
				'#name': 'Test User',
				'#about': 'This is a test bio',
				'#nip05': 'test@example.com',
			}

			for (const [selector, value] of Object.entries(formFields)) {
				await waitForSelectorWithLogging(page, selector, `form field ${selector}`)
				await page.fill(selector, value)
			}

			await waitForSelectorWithLogging(page, '#userDataSubmit', 'submit button')
			await retryClick(page, '#userDataSubmit')

			await waitForSelectorWithLogging(page, '#name', 'name field after submission')
			const userName = await page.inputValue('#name')
			expect(userName).toBe('Test User')
		})

		it('should navigate to account deletion and submit the form', async () => {
			await login(page)

			await waitForSelectorWithLogging(page, '#menuButton', 'menu button')
			await retryClick(page, '#menuButton')

			await waitForSelectorWithLogging(page, 'text=Settings', 'settings option')
			await retryClick(page, 'text=Settings')

			await waitForSelectorWithLogging(page, 'h2>a[href="/settings"]', 'settings page header')

			await waitForSelectorWithLogging(page, 'text=Delete account', 'delete account button')
			await retryClick(page, 'text=Delete account')

			await waitForSelectorWithLogging(page, '#accountDeletionChallenge', 'deletion challenge input')
			await page.fill('#accountDeletionChallenge', 'DELETE')

			await waitForSelectorWithLogging(page, '#executeDeletion:not([disabled])', 'enabled deletion button')
			await retryClick(page, '#executeDeletion')

			const deleteInput = await page.inputValue('#accountDeletionChallenge')
			expect(deleteInput).toBe('DELETE')
		})
	},
)
