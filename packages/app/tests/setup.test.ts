import type { Browser, Page } from 'playwright'
import { expect } from '@playwright/test'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, test } from 'vitest'

import { appSettings, db, eq, users } from '@plebeian/database'

const admin = {
	nsec: 'nsec1p9vaycg0g58zsksxty5wlehqc38wy29agffph95hk0kfknp00gdq6y69rc',
	npub: 'npub16pnjqa0dt4hp6834ac6dv8rqwfvnh472qy9e807hdajk9hyday3qprrfa4',
}

const instance = {
	nsec: 'nsec132205an0m45zn6099acnazl3wxqmtzt6tnh4kyt24qmzhmgspk3su37gpq',
	npub: 'npub13k59umfmf0ql62wvfgyyljnxt3h4famacyd9rvzatx0kmmg9z9sqczhy8m',
}

describe('setup', async () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		browser = await chromium.launch({ headless: true })
		page = await browser.newPage()

		// await db.delete(appSettings).execute()
		await db.update(appSettings).set({ isFirstTimeRunning: true }).execute()
	})

	afterAll(async () => {
		await browser?.close()
	})

	test('visit to root should redirect to /setup', async () => {
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`)

		expect(page.url()).toBe(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/setup`)

		await page.waitForSelector('form')
		const form = await page.$('form')
		expect(form).not.toBeNull()
	})

	test('should display the instance npub input', async () => {
		const instanceNpubInput = await page.$('input[name="instancePk"]')
		expect(instanceNpubInput).not.toBeNull()
	})

	test('should display the owner npub input', async () => {
		const ownerNpubInput = await page.$('input[name="ownerPk"]')
		expect(ownerNpubInput).not.toBeNull()
	})

	test('should display the instance name input', async () => {
		const instanceNameInput = await page.$('input[name="instanceName"]')
		expect(instanceNameInput).not.toBeNull()
	})

	test('should display the logo url input', async () => {
		const logoUrlInput = await page.$('input[name="logoUrl"]')
		expect(logoUrlInput).not.toBeNull()
	})

	test('should display the contact email input', async () => {
		const contactEmailInput = await page.$('input[name="contactEmail"]')
		expect(contactEmailInput).not.toBeNull()
	})

	test('should display the default currency select', async () => {
		const defaultCurrencySelect = await page.$('button[role="combobox"][data-select-trigger]')
		expect(defaultCurrencySelect).not.toBeNull()
	})

	test('should display the allow register checkbox', async () => {
		const allowRegisterCheckbox = await page.$('button[role="checkbox"][placeholder="allow register"]')
		expect(allowRegisterCheckbox).not.toBeNull()
	})

	test('should display the submit button', async () => {
		const submitButton = await page.$('button[type="submit"]')
		expect(submitButton).not.toBeNull()
	})

	test('setup should fill form and submit', async () => {
		await page.fill('input[name="instancePk"]', instance.npub)
		await page.fill('input[name="ownerPk"]', admin.npub)
		await page.fill('input[name="instanceName"]', 'Test Instance')
		await page.fill('input[name="logoUrl"]', 'https://example.com/logo.png')
		await page.fill('input[name="contactEmail"]', 'hello@hello.com')

		await page.check('button[role="checkbox"][placeholder="allow register"]')
		await page.click('button[type="submit"]')

		await page.waitForURL(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/`)

		const [appSettingsRes] = await db.select().from(appSettings).execute()
		const [adminRes] = await db.select().from(users).where(eq(users.role, 'admin')).execute()

		expect(appSettingsRes.isFirstTimeRunning).toBe(false)
		expect(appSettingsRes.instancePk).toBe(instance.npub)

		expect(appSettingsRes.ownerPk).toBe(admin.npub)
		expect(appSettingsRes.instanceName).toBe('Test Instance')
		expect(appSettingsRes.logoUrl).toBe('https://example.com/logo.png')
		expect(appSettingsRes.contactEmail).toBe('hello@hello.com')
		expect(appSettingsRes.defaultCurrency).toBe('USD')
		expect(appSettingsRes.allowRegister).toBe(true)

		expect(adminRes.id).toBe(admin.npub)
	})
})
