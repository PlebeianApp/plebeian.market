// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import 'vite-plugin-pwa/pwa-assets'

declare global {
	namespace App {
		interface Error {
			message: string
		}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
