import type { GlobalSetupContext } from 'vitest/node'
import { execSync } from 'child_process'
import type { PreviewServer } from 'vite'
import { preview } from 'vite'
import dotenv from 'dotenv'

dotenv.config({
	path: '../../.env'
})

let server: PreviewServer

let teardownHappened = false

export async function setup({ provide }: GlobalSetupContext) {
	execSync('pnpm run db:setup', { stdio: 'inherit', cwd: '../database' })
	server = await preview({ preview: { port: process.env.APP_PORT, strictPort: true } })
	global.__SERVER__ = server

	return async () => {
		if (teardownHappened) throw new Error('teardown called twice')
		teardownHappened = true
		await server.close()
	}
}
