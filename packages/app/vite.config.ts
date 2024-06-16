import { sveltekit } from '@sveltejs/kit/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
	test: {
		testTimeout: 25_000,
		hookTimeout: 25_000,
		globalSetup: './tests/globalSetup.ts',
		// alias: {
		// 	$lib: new URL('./src/lib', import.meta.url).pathname,
		// },
	},
	plugins: [
		tsconfigPaths(),
		sveltekit(),
		SvelteKitPWA({
			manifest: {
				name: 'Plebeian Market',
				short_name: 'Plebeian Market',
				description: 'Sell stuff for sats',
				theme_color: '#ffffff',
				icons: [
					{
						src: 'pwa-64x64.png',
						sizes: '64x64',
						type: 'image/png',
					},
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
			disable: mode === 'development',
		}),
	],
	envDir: '../../',
	resolve: {
		alias: {
			$lib: './src/lib',
		},
	},
}))
