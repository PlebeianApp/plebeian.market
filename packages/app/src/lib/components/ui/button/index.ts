import type { Button as ButtonPrimitive } from 'bits-ui'
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

import Root from './button.svelte'

const buttonVariants = tv({
	base: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-black box hover:translated',
	variants: {
		variant: {
			primary: 'bg-primary text-primary-foreground border-primary-border hover:bg-primary/90',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
			outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
			secondary: 'bg-secondary text-secondary-foreground border-secondary-border hover:bg-secondary/80',
			tertiary: 'bg-tertiary text-tertiary-foreground border-tertiary-border hover:bg-tertiary/80',
			focus: 'bg-focus text-focus-foreground border-focus-border hover:bg-focus/80',
			ghost: 'hover:bg-accent border-none hover:text-accent-foreground',
			link: 'text-primary border-none underline-offset-4 hover:underline',
			none: 'border-0 p-0 text-base justify-start',
		},
		size: {
			default: 'h-10 px-4 py-2',
			sm: 'h-9 rounded-md px-3',
			lg: 'h-11 rounded-md px-8',
			icon: 'h-10 w-10',
		},
	},
	defaultVariants: {
		variant: 'primary',
		size: 'default',
	},
})

type Variant = VariantProps<typeof buttonVariants>['variant']
type Size = VariantProps<typeof buttonVariants>['size']

type Props = ButtonPrimitive.Props & {
	variant?: Variant
	size?: Size
}

type Events = ButtonPrimitive.Events

export {
	//
	Root as Button,
	buttonVariants,
	Root,
	type Events as ButtonEvents,
	type Props as ButtonProps,
	type Events,
	type Props,
}
