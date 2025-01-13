<script lang="ts">
	export let title: string | undefined = undefined
	export let forItemType: string = 'product'
</script>

{#if forItemType === 'product'}
	<div class="my-16 mx-8">
		{#if title}
			<h2>{title}</h2>
		{/if}
		<div class="grid grid-cols-1 gap-8 md:gap-16 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
			<slot />
		</div>
	</div>
{:else if forItemType === 'stall'}
	<div class="my-16 mx-8">
		{#if title}
			<h2>{title}</h2>
		{/if}
		<div class="grid grid-cols-1 gap-8 md:gap-16 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			<slot />
		</div>
	</div>
{/if}
