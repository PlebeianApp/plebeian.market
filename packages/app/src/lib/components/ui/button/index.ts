import type { Button as ButtonPrimitive } from 'bits-ui'
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'

import Root from './button.svelte'

const buttonVariants = tv({
	base: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-black box hover:translated',
	variants: {
		variant: {
			primary:
				'bg-primary text-primary-foreground border-primary-border hover:bg-transparent hover:text-primary-foreground-hover hover:border-primary-border-hover active:ho',
			secondary:
				'bg-secondary text-secondary-foreground border-secondary-border hover:bg-transparent hover:text-secondary-foreground-hover hover:border-secondary-border-hover',
			tertiary:
				'bg-tertiary text-tertiary-foreground border-tertiary-border hover:bg-tertiary-hover hover:text-tertiary-foreground-hover hover:border-tertiary-border-hover',
			focus:
				'bg-focus text-focus-foreground border-focus-border hover:bg-transparent hover:text-focus-foreground-hover hover:border-focus-border-hover',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-transparent hover:text-destructive-foreground',

			outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
			ghost: 'hover:bg-accent border-none hover:text-accent-foreground',
			link: 'text-secondary border-none underline-offset-4 hover:underline',
			none: 'border-0 p-0 text-base justify-start',
		},
		size: {
			default: 'h-10 px-4 py-2',
			sm: 'h-9 px-3',
			lg: 'h-11  px-8',
			icon: 'h-10 aspect-square',
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
