<script lang="ts">
	import { cn } from '$lib/utils.js'
	import { onDestroy } from 'svelte'
	import { writable } from 'svelte/store'

	import type { CarouselAPI, CarouselProps } from './context.js'
	import { setEmblaContex } from './context.js'

	type $$Props = CarouselProps

	export let opts = {}
	export let plugins: NonNullable<$$Props['plugins']> = []
	export let api: $$Props['api'] = undefined
	export let orientation: NonNullable<$$Props['orientation']> = 'horizontal'

	let className: $$Props['class'] = undefined
	export { className as class }

	const apiStore = writable<CarouselAPI | undefined>(undefined)
	const orientationStore = writable(orientation)
	const canScrollPrev = writable(false)
	const canScrollNext = writable(false)
	const optionsStore = writable(opts)
	const pluginStore = writable(plugins)

	$: orientationStore.set(orientation)
	$: pluginStore.set(plugins)
	$: optionsStore.set(opts)

	function scrollPrev() {
		api?.scrollPrev()
	}
	function scrollNext() {
		api?.scrollNext()
	}

	function onSelect(api: CarouselAPI) {
		if (!api) return
		canScrollPrev.set(api.canScrollPrev())
		canScrollNext.set(api.canScrollNext())
	}

	$: if (api) {
		onSelect(api)
		api.on('select', onSelect)
		api.on('reInit', onSelect)
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') {
			e.preventDefault()
			scrollPrev()
		} else if (e.key === 'ArrowRight') {
			e.preventDefault()
			scrollNext()
		}
	}

	setEmblaContex({
		api: apiStore,
		scrollPrev,
		scrollNext,
		orientation: orientationStore,
		canScrollNext,
		canScrollPrev,
		handleKeyDown,
		options: optionsStore,
		plugins: pluginStore,
		onInit,
	})

	function onInit(event: CustomEvent<CarouselAPI>) {
		api = event.detail
		apiStore.set(api)
	}

	onDestroy(() => {
		api?.off('select', onSelect)
	})
</script>

<div class={cn('relative', className)} on:mouseenter on:mouseleave role="region" aria-roledescription="carousel" {...$$restProps}>
	<slot />
</div>
