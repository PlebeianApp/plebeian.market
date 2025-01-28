<script lang="ts">
	import { isUserVerified } from '$lib/nostrSubs/utils'
	import { BadgeAlert, BadgeCheck } from 'lucide-svelte'
	import { onMount } from 'svelte'

	import { Skeleton } from '../ui/skeleton'

	export let userId: string
	let userVerified: boolean | null = null
	let loading = false

	onMount(async () => {
		loading = true
		userVerified = await isUserVerified(userId)
		loading = false
	})
</script>

{#if loading}
	<Skeleton class=" h-6 w-6" />
{:else if userVerified}
	<BadgeCheck fill="var(--secondary)" color="var(--primary)" class="w-6 h-6 mt-1" />
{:else if userVerified == false}
	<BadgeAlert fill="var(--destructive)" color="var(--primary)" class="w-6 h-6 mt-1" />
{/if}
