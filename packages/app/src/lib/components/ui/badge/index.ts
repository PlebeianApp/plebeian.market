import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

export { default as Badge } from './badge.svelte'

export const badgeVariants = tv({
	base: 'inline-flex select-none items-center rounded-full border text-xs font-semibold transition-colors focus:outline-none focus:text-primary',
	variants: {
		variant: {
			primary: 'bg-primary border-primary hover:border-primary-border-hover text-primary-foreground-hover active:bg-primary-border-hover',
			secondary: 'bg-light-gray text-off-black border-none',
			destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
			outline: 'text-foreground',
		},
		size: {
			default: 'px-4 py-2',
			sm: 'px-2.5 py-0.5',
		},
	},
	defaultVariants: {
		variant: 'primary',
		size: 'default',
	},
})

export type Variant = VariantProps<typeof badgeVariants>['variant']
export type Size = VariantProps<typeof badgeVariants>['size']
