<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const { menuItems } = data
</script>

{#each menuItems as item}
	<div class="pb-4">
		<section>
			<a href={item.root}>
				<h3 class="text-lg font-bold">{item.title}</h3>
				<p class="text-gray-600">{item.description}</p>
			</a>
		</section>
		<ul class="list-none">
			{#each item.links as link}
				<li class="mb-2">
					<a href={link.href}>
						<p class={link.title == 'Delete account' ? 'text-[hsl(var(--destructive))]' : ''}>{link.title}</p>
						<span class="text-gray-600 text-sm">{link.description}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
	<Separator class="mb-2" />
{/each}
