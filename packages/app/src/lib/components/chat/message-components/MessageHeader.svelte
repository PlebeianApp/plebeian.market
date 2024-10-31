<script lang="ts">
	export let title: string
	export let status: string | undefined
	export let icon: string | undefined
</script>

<div class="flex justify-between items-center mb-3">
	<div class="flex items-center gap-2">
		{#if icon}
			<span class={`${icon} w-4 h-4`} />
		{/if}
		<span class="font-medium text-sm">{title}</span>
	</div>
	{#if status}
		<span class="px-2 py-1 text-xs rounded-full bg-secondary/80">
			{status}
		</span>
	{/if}
</div>
