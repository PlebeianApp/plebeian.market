import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { opts } from './globalSetup'

const login = async (page: Page) => {
	await page.click('#menuButton')
	await page.click('text=Log in')
	await page.waitForSelector('#signInSk')
	await page.fill('#signInSk', 'ee40a2dc441238f241d1728af9507147e9b5ed18c1c61d84876d4f2502c044b3')
	await page.fill('#signInPass', '123')
	await page.click('#signInSubmit')
}

describe(
	'settings',
	async () => {
		let browser: Browser
		let page: Page

		beforeAll(async () => {
			browser = await chromium.launch(opts)
			page = await browser.newPage()
			await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/settings`)
			await page.waitForSelector('text=You must login')
			await login(page)
		})

		afterAll(async () => {
			await browser?.close()
		})

		it('should navigate to user settings and submit the form', async () => {
			await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/`)
			await login(page)
			await page.waitForTimeout(1000)
			await page.click('text=Settings')
			await page.waitForSelector('h2>a[href="/settings"]', { timeout: 1000 })
			await page.click('text=Profile')
			await page.fill('#name', 'Test User')
			await page.fill('#about', 'This is a test bio')
			await page.fill('#nip05', 'test@example.com')
			await page.click('#userDataSubmit', { delay: 100 })
			const userName = await page.inputValue('#name')
			expect(userName).toBe('Test User')
		})

		it('should navigate to account deletion and submit the form', async () => {
			await page.click('text=Delete account', { delay: 1000 })
			await page.waitForSelector('#accountDeletionChallenge')
			await page.fill('#accountDeletionChallenge', 'DELETE')
			await page.click('#executeDeletion')
			const deleteInput = await page.inputValue('#accountDeletionChallenge')
			expect(deleteInput).toBe('DELETE')
		})
	},
	{ sequential: true },
)
