<script lang="ts">
	import { Badge } from '$lib/components/ui/badge'
	import { Card } from '$lib/components/ui/card'

	export let title: string
	export let items: string[] = []
</script>

<Card class="p-6">
	<header class="mb-4">
		<h3 class="text-lg font-semibold">{title}</h3>
	</header>

	<div class="content max-h-[60vh] overflow-y-auto pr-2">
		<div class="flex flex-row gap-2 flex-wrap">
			{#each items as item}
				<Badge variant="secondary">{item}</Badge>
			{/each}
		</div>
	</div>
</Card>
