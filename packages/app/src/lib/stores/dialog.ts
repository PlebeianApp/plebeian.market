import type { ComponentType, SvelteComponent } from 'svelte'
import { get, writable } from 'svelte/store'

type DialogComponent = ComponentType<SvelteComponent>
type DialogCallback = () => void
type DialogId = string

export type DialogOptions = {
	onClose?: DialogCallback
	onAction?: DialogCallback
}

type ExtractProps<T extends DialogComponent> = T extends ComponentType<infer Props> ? Omit<Props, keyof SvelteComponent> : never

interface DialogItem<T extends DialogComponent = DialogComponent> {
	id: DialogId
	component: T
	props: ExtractProps<T>
	onClose?: DialogCallback
	onAction?: DialogCallback
}

interface DialogState {
	queue: DialogItem[]
	currentDialog: DialogItem | null
	open: boolean
}

const createInitialState = (): DialogState => ({
	queue: [],
	currentDialog: null,
	open: false,
})

const ANIMATION_DELAY = 10

function createDialogStore() {
	const store = writable<DialogState>(createInitialState())

	const processNextDialog = () => {
		store.update((state) => {
			if (state.queue.length === 0) {
				return createInitialState()
			}

			const [nextDialog, ...remainingQueue] = state.queue
			return {
				queue: remainingQueue,
				currentDialog: nextDialog,
				open: true,
			}
		})
	}

	const closeCurrentDialog = () => {
		const state = get(store)
		if (state.currentDialog?.onClose) {
			state.currentDialog.onClose()
		}

		store.update((state) => ({
			...state,
			open: false,
		}))

		setTimeout(processNextDialog, ANIMATION_DELAY)
	}

	return {
		subscribe: store.subscribe,

		show: <T extends DialogComponent>(
			component: T,
			props: ExtractProps<T> = {} as ExtractProps<T>,
			{ onClose, onAction }: DialogOptions = {},
		): DialogId => {
			const dialogItem: DialogItem<T> = {
				id: crypto.randomUUID(),
				component,
				props,
				onClose,
				onAction,
			}

			store.update((state) => {
				if (!state.currentDialog) {
					return {
						queue: [],
						currentDialog: dialogItem,
						open: true,
					}
				}

				return {
					...state,
					queue: [...state.queue, dialogItem],
				}
			})

			return dialogItem.id
		},

		hide: (dialogId?: DialogId) => {
			const state = get(store)

			if (dialogId && state.currentDialog?.id !== dialogId) {
				store.update((state) => ({
					...state,
					queue: state.queue.filter((d) => d.id !== dialogId),
				}))
				return
			}

			closeCurrentDialog()
		},

		handleAction: () => {
			const state = get(store)
			if (state.currentDialog?.onAction) {
				state.currentDialog.onAction()
			}

			closeCurrentDialog()
		},

		clearAll: () => {
			store.set(createInitialState())
		},
	}
}

export const dialogs = createDialogStore()
