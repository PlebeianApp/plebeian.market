const path = require('path')

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
	tailwindConfig: path.resolve(__dirname, '../../packages/app/tailwind.config.js'),
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

module.exports = config
