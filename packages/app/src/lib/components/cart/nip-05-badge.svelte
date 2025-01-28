<script lang="ts">
	import { isUserVerified } from '$lib/nostrSubs/utils'
	import { BadgeCheck } from 'lucide-svelte'
	import { onMount } from 'svelte'

	import { Skeleton } from '../ui/skeleton'

	export let userId: string
	let userVerified = false
	let loading = false

	onMount(async () => {
		loading = true
		userVerified = await isUserVerified(userId)
		loading = false
	})
</script>

{#if loading}
	<Skeleton class="h-4 w-[250px]" />
{:else if userVerified}
	<BadgeCheck fill="#ff3eb5" color="#1d1d1d" class="w-6 h-6 mt-1" />
{:else}
	<BadgeCheck color="#bf4040" class="w-6 h-6 mt-1" />
{/if}
