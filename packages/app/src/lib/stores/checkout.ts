import type { CheckoutFormData } from '$lib/schema'
import { writable } from 'svelte/store'

export const checkoutFormStore = writable<CheckoutFormData | null>(null)
export const currentStep = writable(0)
