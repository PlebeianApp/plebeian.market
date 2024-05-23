// import { browser } from '$app/env'
import { isInitialSetup } from '$lib/server/setup.service'
import { writable } from 'svelte/store'

// const persistentStore = (key: string, startValue: boolean | null) => {
// 	let initialValue = startValue
// 	if (browser) {
// 		const storedValue = localStorage.getItem(key)
// 		initialValue = storedValue === null ? startValue : JSON.parse(storedValue)
// 	}
// 	const store = writable(initialValue)

// 	store.subscribe((value) => {
// 		if (browser) {
// 			localStorage.setItem(key, JSON.stringify(value))
// 		}
// 	})

// 	return store
// }

// const setupStatus = persistentStore('setupStatus', null)

export const fetchSetupStatus = async (): Promise<boolean> => {
	// console.log('fetchSetupStatus')
	const response = await isInitialSetup()
	// setupStatus.set(response)
	console.log(response)
	return response
}
