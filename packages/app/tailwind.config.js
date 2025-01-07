import { getIconCollections, iconsPlugin } from '@egoist/tailwindcss-icons'

/** @type {import('tailwindcss').Config} */
const config = {
	plugins: [
		iconsPlugin({
			// Select the icon collections you want to use
			// You can also ignore this option to automatically discover all individual icon packages you have installed
			// If you install @iconify/json, you should explicitly specify the collections you want to use, like this:
			collections: getIconCollections(['game-icons', 'ion', 'simple-icons', 'mingcute', 'tdesign', 'mdi', 'bitcoin-icons']),
			// If you want to use all icons from @iconify/json, you can do this:
			// collections: getIconCollections("all"),
			// and the more recommended way is to use `dynamicIconsPlugin`, see below.
		}),
	],
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1600px',
			},
		},
		extend: {
			colors: {
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring) )',
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)',
					border: 'var(--primary-border)',
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)',
					border: 'var(--secondary-border)',
				},
				tertiary: {
					DEFAULT: 'var(--tertiary)',
					foreground: 'var(--tertiary-foreground)',
					border: 'var(--tertiary-border)',
				},
				focus: {
					DEFAULT: 'var(--focus)',
					foreground: 'var(--focus-foreground)',
					border: 'var(--focus-border)',
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)',
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)',
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)',
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)',
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			boxShadow: {
				base: '4px 4px 0px 0px rgba(0,0,0,1)',
			},
			fontFamily: {
				sans: ['"IBM Plex Mono"', 'monospace'],
				heading: ['reglisse', 'sans-serif']
			},
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
			  },
			width: {
			'popover': 'calc(100% - 2vw)',
			}
		},
	},
}

export default config
