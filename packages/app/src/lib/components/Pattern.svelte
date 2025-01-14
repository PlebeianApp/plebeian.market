<script lang="ts">
	export let pattern: 'dots' | 'page' = 'dots'
</script>

<div
	class={`absolute inset-0 -z-0 min-h-full w-full ${$$restProps.class ?? ''}`}
	style={`background: url(/${pattern}-min.png); background-repeat: repeat; background-size: auto; bottom: 0;`}
></div>
