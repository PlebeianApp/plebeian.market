import type { ComponentType, SvelteComponent } from 'svelte'
import { writable } from 'svelte/store'

type DialogComponent = ComponentType<SvelteComponent>

type ExtractProps<T extends DialogComponent> = T extends ComponentType<infer Props> ? Omit<Props, keyof SvelteComponent> : never

interface DialogState {
	component: DialogComponent | null
	props: Record<string, unknown>
	open: boolean
}

function createDialogStore() {
	const { subscribe, update, set } = writable<DialogState>({
		component: null,
		props: {},
		open: false,
	})

	return {
		subscribe,
		show: <T extends DialogComponent>(component: T, props: ExtractProps<T> = {} as ExtractProps<T>) => {
			update(() => ({
				component,
				props,
				open: true,
			}))
		},
		hide: () => {
			update((state) => ({
				...state,
				open: false,
			}))
		},
		reset: () => {
			set({
				component: null,
				props: {},
				open: false,
			})
		},
	}
}

export const dialogs = createDialogStore()
