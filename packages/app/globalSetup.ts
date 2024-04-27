import type { GlobalSetupContext } from 'vitest/node'
import { execSync } from 'child_process'

export default function setup({ provide }: GlobalSetupContext) {
	execSync('pnpm run db:setup', { stdio: 'inherit', cwd: '../database' })
}
