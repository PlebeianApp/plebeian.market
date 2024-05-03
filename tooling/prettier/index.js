import { fileURLToPath } from 'url'

/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
	useTabs: true,
	singleQuote: true,
	semi: false,
	printWidth: 140,
	plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss', 'prettier-plugin-svelte'],
	tailwindConfig: fileURLToPath(new URL('../../packages/app/tailwind.config.js', import.meta.url)),
	tailwindFunctions: ['cn', 'cva'],
	importOrder: [
		'<TYPES>',
		'<THIRD_PARTY_MODULES>',
		'',
		'<TYPES>^@plebeian',
		'^@plebeian/(.*)$',
		'',
		'<TYPES>^[.|..|~]',
		'^~/',
		'^[../]',
		'^[./]',
	],
	importOrderParserPlugins: ['typescript', 'decorators-legacy'],
	importOrderTypeScriptVersion: '4.4.0',
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte',
			},
		},
	],
}

export default config
