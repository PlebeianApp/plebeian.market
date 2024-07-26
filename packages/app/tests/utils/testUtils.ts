import type { Browser, LaunchOptions, Page } from 'playwright'
import { chromium } from 'playwright'

import { config } from '../config'
import { assertElementExists, TestError } from './errorUtils'

declare module 'vitest' {
	interface Assertion {
		toBeVisible(): Promise<void>
		toHaveInputValue(selector: string, expectedValue: string): Promise<void>
	}
}

export const browserOptions: LaunchOptions = {
	headless: true,
}

export async function safeClick(page: Page, selector: string): Promise<void> {
	const element = await page.$(selector)
	assertElementExists(element, `Element with selector "${selector}" not found`)
	if (element) {
		await element.click().catch((error) => {
			throw new TestError(`Failed to click element with selector "${selector}"`, { originalError: error })
		})
	} else {
		throw new TestError(`Element with selector "${selector}" not found`)
	}
}
export async function setupBrowser(): Promise<{ browser: Browser; page: Page }> {
	const browser = await chromium.launch(browserOptions)
	const page = await browser.newPage()
	return { browser, page }
}

export async function teardownBrowser(browser: Browser): Promise<void> {
	await browser.close()
}

export async function login(page: Page): Promise<void> {
	await page.click('#menuButton')
	await page.click('text=Log in')
	await page.click('text=Private Key')
	await page.waitForSelector('#signInSk')
	await page.fill('#signInSk', config.testUserPrivateKey)
	await page.fill('#signInPass', config.testUserPassword)
	await page.click('#signInSubmit')
}
