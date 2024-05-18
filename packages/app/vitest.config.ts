/// <reference types="vitest" />
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		testTimeout: 25_000,
		hookTimeout: 25_000,
		alias: {
			$lib: new URL('./src/lib', import.meta.url).pathname,
		},
	},
	plugins: [tsconfigPaths()],
})
