import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess({})],
	kit: {
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
