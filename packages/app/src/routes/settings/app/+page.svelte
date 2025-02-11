<script lang="ts">
	import { goto } from '$app/navigation'
	import Button from '$lib/components/ui/button/button.svelte'
	import Separator from '$lib/components/ui/separator/separator.svelte'

	import type { PageData } from './$types'

	export let data: PageData
	const [{ title, description, links }] = data.menuItems.filter((item) => item.value === 'app-settings')
</script>

<div class="pb-4 space-y-2">
	<div>
		<div class=" flex items-center gap-1">
			<section>
				<h3 class="text-lg font-bold">{title}</h3>
				<p class="text-gray-600">{description}</p>
			</section>
		</div>
	</div>
	<ul class="list-none">
		{#each links as link}
			<li class="mb-2">
				<a href={link.href}>
					<p class={link.title == 'Delete account' ? 'text-[hsl(var(--destructive))]' : ''}>{link.title}</p>
					<p class="text-gray-600 text-sm">{link.description}</p>
				</a>
			</li>
		{/each}
	</ul>
</div>
<Separator class="mb-2" />
