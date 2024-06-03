import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('settings', async () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		browser = await chromium.launch({ headless: true })
		page = await browser.newPage()

		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/settings`)

		await page.waitForSelector('text=You must login')

		await page.click('#menuButton')
		await page.click('text=Log in')

		await page.waitForSelector('text=Sign up')

		await page.click('text=Sign up')

		await page.waitForSelector('#signUpPassword')
		await page.fill('input[id="signUpPassword"]', 'aaaaaaaa')

		await page.click('button[id="signUpSubmit"]')
	})

	afterAll(async () => {
		await browser?.close()
	})

	it('should navigate to user settings and submit the form', async () => {
		await page.waitForSelector('text=Settings')

		await page.waitForSelector('text=User settings')
		await page.click('text=User settings')

		await page.fill('#name', 'Test User')
		await page.fill('#about', 'This is a test bio')
		await page.fill('#nip05', 'test@example.com')
		await page.click('#userDataSubmit')
		const userName = await page.$eval('#name', (el) => el.value)
		expect(userName).toBe('Test User')
	})

	it('should navigate to account deletion and submit the form', async () => {
		await page.waitForSelector('text=Delete account')
		await page.click('text=Delete account')

		await page.waitForSelector('#deletionIntent')
		await page.click('#deletionIntent')

		await page.waitForSelector('#accountDeletionChallange')
		await page.fill('#accountDeletionChallange', 'Test User')

		await page.click('#executeDeletion')

		await page.waitForURL(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`)
	})
})
