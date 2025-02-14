<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { breakpoint } from '$lib/stores/breakpoint'
	import { shareContent } from '$lib/utils'
	import { Share } from 'lucide-svelte'

	import ShareDropdown from './share-dropdown.svelte'

	export let title: string = ''
	export let text: string = ''
	export let url: string = ''

	function handleShare() {
		const shareData = {
			title: title || 'Check out this item',
			text: text || `Check out this on #plebeianmarket ${url}`,
			url,
		}
		shareContent(shareData)
	}
</script>

{#if $breakpoint === 'sm'}
	<Button size="icon" variant="primary" on:click={handleShare}>
		<Share slot="icon" class="h-4 w-4" />
	</Button>
{:else}
	<ShareDropdown {title} {text} {url} />
{/if}
