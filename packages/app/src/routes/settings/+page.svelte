<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { activeUserQuery, createUserExistsQuery } from '$lib/fetch/users.queries'
	import ndkStore from '$lib/stores/ndk'

	import type { PageData } from './$types'

	export let data: PageData
	$: ({ menuItems } = data)
	$: userExist = $ndkStore.activeUser?.pubkey ? createUserExistsQuery($ndkStore.activeUser?.pubkey) : undefined
</script>

{#each menuItems as item}
	{#if $activeUserQuery.data?.role === 'admin' || item.value !== 'app-settings'}
		<div class="pb-4 space-y-2">
			<section>
				<a href={item.root}>
					<h3 class="text-lg font-bold">{item.title}</h3>
					<p class=" opacity-70">{item.description}</p>
				</a>
			</section>
			<ul>
				{#each item.links as link}
					{#if link.public || $userExist?.data}
						<li>
							<a href={link.href}>
								<p class={link.title == 'Delete account' ? 'text-[hsl(var(--destructive))]' : ''}>{link.title}</p>
								<span class="opacity-50 text-sm">{link.description}</span>
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		</div>
		<Separator class="mb-2" />
	{/if}
{/each}
