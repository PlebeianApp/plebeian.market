/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	test: {
		testTimeout: 25_000,
		hookTimeout: 25_000,
		globalSetup: './tests/globalSetup.ts',
		alias: {
			$lib: new URL('./src/lib', import.meta.url).pathname
		}
	},
	plugins: [tsconfigPaths()]
})
