/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	test: {
		testTimeout: 60_000,
		hookTimeout: 60_000,
		fileParallelism: false,
		globalSetup: './globalSetup.ts'
	},
	plugins: [tsconfigPaths()]
})
