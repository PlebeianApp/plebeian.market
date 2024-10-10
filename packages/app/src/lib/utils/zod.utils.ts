import type { ZodError, ZodSchema } from 'zod'
import { toast } from 'svelte-sonner'

export type ValidationErrors = Partial<Record<string, string>>

export function validateForm<T extends Record<string, unknown>>(data: T, schema: ZodSchema): ValidationErrors {
	const result = schema.safeParse(data)
	if (result.success) {
		return {}
	} else {
		return formatZodErrors(result.error)
	}
}

function formatZodErrors(error: ZodError): ValidationErrors {
	return error.issues.reduce((acc, issue) => {
		const path = issue.path.join('.')
		acc[path] = issue.message
		return acc
	}, {} as ValidationErrors)
}

export const displayZodErrors = (error: ZodError): void => {
	error.errors.forEach((err) => {
		const errorMessage = `${err.path.join('.')}: ${err.message}`
		toast.error(errorMessage)
		console.log(errorMessage)
	})
}
