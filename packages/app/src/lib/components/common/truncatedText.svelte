<script lang="ts">
	import { externalLinks } from '$lib/actions/external-links'
	import { Button } from '$lib/components/ui/button'

	export let text: string
	export let maxLength = 256
	export let expandButtonClass = 'mt-2'
	export let buttonSize: 'default' | 'sm' | 'lg' | 'icon' = 'icon'
	export let buttonVariant: 'primary' | 'destructive' | 'outline' | 'secondary' | 'tertiary' | 'ghost' | 'link' = 'outline'

	let expanded = false

	$: needsTruncation = text.length > maxLength
	$: displayText = !expanded && needsTruncation ? text.slice(0, maxLength) + '...' : text
</script>

{#key expanded}
	<div class="relative">
		<div use:externalLinks>
			<p class="break-words">
				{displayText}
			</p>
		</div>

		{#if needsTruncation}
			<Button size={buttonSize} variant={buttonVariant} class={expandButtonClass} on:click={() => (expanded = !expanded)}>
				<span class={expanded ? 'i-mdi-minus' : 'i-mdi-plus'} />
			</Button>
		{/if}
	</div>
{/key}
