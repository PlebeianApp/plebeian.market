import type { ComponentType, SvelteComponent } from 'svelte'

export type ComponentProps = Record<string, unknown>

export interface Step {
	component: ComponentType<SvelteComponent>
	props: Record<string, unknown>
}
