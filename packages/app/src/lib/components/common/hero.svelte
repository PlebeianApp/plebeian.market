<script lang="ts">
	import Pattern from '$lib/components/Pattern.svelte'

	export let bgColor = 'black'
	export let py = '20'
	export let showPattern = true
	export let gradientColor = 'var(--secondary)'
	export let gradientOpacity = '0.3'
	export let gradientPosition = 'bottom'
	export let gradientStartPercentage = '20'
	export let gradientEndPercentage = '70'
	export let innerContainerClass = ''
</script>

<div class={`flex flex-col relative w-full text-white ${$$restProps.class ?? ''}`} style:background-color={bgColor} id="hero-section">
	<div
		class="absolute inset-x-0 -bottom-18 h-full blur-2xl"
		style:background={`radial-gradient(ellipse at ${gradientPosition}, ${gradientColor} ${gradientStartPercentage}%, transparent ${gradientEndPercentage}%)`}
		style:opacity={gradientOpacity}
	></div>

	{#if showPattern}
		<Pattern />
	{/if}

	<div class={`relative py-${py} text-center ${innerContainerClass}`}>
		<slot />
	</div>
</div>
