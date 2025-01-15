<script lang="ts">
	import Skeleton from '../ui/skeleton/skeleton.svelte'

	export let count = 1
</script>

{#each Array(count).fill(null) as _}
	<Skeleton {...$$restProps} />
{/each}
