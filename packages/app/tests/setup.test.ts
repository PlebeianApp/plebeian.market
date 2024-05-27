import type { Browser, Page } from 'playwright'
import { expect } from '@playwright/test'
import * as setupSvcExports from '$lib/server/setup.service'
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { chromium } from 'playwright'
import { afterAll, afterEach, beforeAll, describe, test, vi } from 'vitest'

import { appSettings, db, desc, eq, users } from '@plebeian/database'

const admin = {
	nsec: 'nsec1p9vaycg0g58zsksxty5wlehqc38wy29agffph95hk0kfknp00gdq6y69rc',
	npub: 'npub16pnjqa0dt4hp6834ac6dv8rqwfvnh472qy9e807hdajk9hyday3qprrfa4',
}

const instance = {
	nsec: 'nsec132205an0m45zn6099acnazl3wxqmtzt6tnh4kyt24qmzhmgspk3su37gpq',
	npub: 'npub13k59umfmf0ql62wvfgyyljnxt3h4famacyd9rvzatx0kmmg9z9sqczhy8m',
}

vi.spyOn(setupSvcExports, 'isInitialSetup')
vi.mock('$lib/server/setup.service', async (importOriginal) => {
	return {
		...(await importOriginal<typeof import('$lib/server/setup.service')>()),
		isInitialSetup: async () => false,
	}
})

describe('setup', async () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		await db.delete(appSettings).execute()
		await db.delete(users).execute()
		await db.insert(appSettings).values({ isFirstTimeRunning: true, instancePk: '' }).execute()
		browser = await chromium.launch({ headless: true })
		page = await browser.newPage()
	})

	afterAll(async () => {
		await browser?.close()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	test('visit to root should redirect to /setup', async () => {
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/`)

		await page.waitForURL(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/setup`)

		expect(page.url()).toBe(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/setup`)
		await page.waitForSelector('form')
		const form = await page.$('form')
		expect(form).not.toBeNull()
	})

	test('setup should fill form and submit', async () => {
		const sk = generateSecretKey()
		const newPk = getPublicKey(sk)

		const npub = nip19.npubEncode(newPk)

		const decodedAdminPk = nip19.decode(npub).data
		const decodedInstancePk = nip19.decode(instance.npub).data

		await page.fill('input[name="instancePk"]', instance.npub)
		await page.fill('input[name="ownerPk"]', npub)
		await page.fill('input[name="instanceName"]', 'Test Instance')
		await page.fill('input[name="logoUrl"]', 'https://example.com/logo.png')
		await page.fill('input[name="contactEmail"]', 'hello@hello.com')

		await page.check('button[role="checkbox"][placeholder="allow register"]')
		await page.click('button[type="submit"]')

		await new Promise((resolve) => setTimeout(resolve, 100))

		const [appSettingsRes] = await db.select().from(appSettings).execute()
		const [adminRes] = await db.select().from(users).orderBy(desc(users.createdAt)).where(eq(users.id, decodedAdminPk)).execute()

		expect(appSettingsRes.isFirstTimeRunning).toBe(false)
		expect(appSettingsRes.instancePk).toBe(decodedInstancePk)

		expect(appSettingsRes.ownerPk).toBe(decodedAdminPk)
		expect(appSettingsRes.instanceName).toBe('Test Instance')
		expect(appSettingsRes.logoUrl).toBe('https://example.com/logo.png')
		expect(appSettingsRes.contactEmail).toBe('hello@hello.com')
		expect(appSettingsRes.defaultCurrency).toBe('BTC')
		expect(appSettingsRes.allowRegister).toBe(true)

		expect(adminRes.id).toBe(decodedAdminPk)
	})
})
