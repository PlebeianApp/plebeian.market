import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import packageJson from './package.json' with { type: 'json' }

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess({})],
	kit: {
		version: {
			name: packageJson.version
		},
		adapter: adapter(),
		prerender: {
			handleHttpError: ({ status, path, referrer, referenceType }) => {
			  if (status === 404) {
				console.warn(`Received 404 error on path: ${path} from referrer: ${referrer}`);
				return;
			  }
			  throw new Error(`${status} ${path} (${referenceType} from ${referrer})`);
			}
		  },
		alias: {
			$lib: './src/lib',
		},
		serviceWorker: {
			register: false
		},
		paths: {
			relative: false
		}
	},
}

export default config
