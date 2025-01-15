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
</script>

<div class="relative w-full text-white" style:background-color={bgColor} {...$$restProps}>
	<div
		class="absolute inset-x-0 -bottom-18 h-full blur-2xl"
		style:background={`radial-gradient(ellipse at ${gradientPosition}, ${gradientColor} ${gradientStartPercentage}%, transparent ${gradientEndPercentage}%)`}
		style:opacity={gradientOpacity}
	></div>

	{#if showPattern}
		<Pattern />
	{/if}

	<div class="relative py-{py} text-center">
		<slot />
	</div>
</div>
