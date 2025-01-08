<script lang="ts">
	export let pattern: 'dots' | 'page' = 'dots'
</script>

<div
	class="absolute top-0 -z-0 h-full w-full"
	style={`background: url(/${pattern}-min.png); background-repeat: repeat; background-size: auto;`}
></div>
