import type { Browser, Page } from 'playwright'
import { isInitialSetup } from '$lib/server/setup.service'
import * as setupSvcExports from '$lib/server/setup.service'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

const login = async (page: Page) => {
	const pageCOnteng = await page.innerHTML('body')

	console.log(pageCOnteng)

	await page.click('#menuButton')
	await page.click('text=Log in')
	await page.waitForSelector('#signInSk')
	await page.fill('#signInSk', 'nsec159fuyawnrq4s2gxjdjuhusvz5s5cfxamu8kfkmkunrz90ydtwzfqsl6g37')
	await page.fill('#signInPass', '123')
	await page.click('#signInSubmit')
}

vi.spyOn(setupSvcExports, 'isInitialSetup')
vi.mock('$lib/server/setup.service', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/server/setup.service')>()
	return {
		...actual,
		isInitialSetup: vi.fn().mockResolvedValue(false),
	}
})

describe('settings', async () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		browser = await chromium.launch({ headless: true })
		page = await browser.newPage()

		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/settings`)

		const pageContent = await page.innerHTML('h2')

		console.log(pageContent)

		await page.waitForSelector('text=You must login')
		await login(page)
	})

	afterAll(async () => {
		await browser?.close()
	})

	it('should always return initialSetup as false', async () => {
		// Call the load function
		const result = await isInitialSetup()

		// Assert the result
		expect(result).toEqual(false)
	})

	it('should navigate to user settings and submit the form', async () => {
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/settings/account/profile`)
		await login(page)

		const pageTitle = await page.textContent('h2')

		expect(pageTitle).toBe('Profile')

		await page.waitForSelector('h2>a[href="/settings"]')
		await page.waitForSelector('label[for="userImage"]')
		await page.fill('#name', 'Test User')
		await page.fill('#about', 'This is a test bio')
		await page.fill('#nip05', 'test@example.com')
		await page.click('#userDataSubmit')
		const userName = await page.$eval('#name', (el) => el.value)
		expect(userName).toBe('Test User')
	})

	it('should navigate to account deletion and submit the form', async () => {
		await page.waitForSelector('h2>a[href="/settings"]')
		await page.click('text=Delete account')
		await page.waitForSelector('#accountDeletionChallange')
		await page.fill('#accountDeletionChallange', 'Test User')
		await page.click('#executeDeletion')
		await page.waitForURL(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`)
	})
})
