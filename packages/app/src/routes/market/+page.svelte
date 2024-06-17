<script lang="ts">
	import { stallSub } from '$lib/nostrSubs/subs'
	import { onDestroy } from 'svelte'

	stallSub.ref()
	onDestroy(() => {
		stallSub.unref()
	})
</script>

-------------
{$stallSub.length}
{#each $stallSub as event}
	<p>{event.id}- {event.relay?.url}</p>
{/each}
