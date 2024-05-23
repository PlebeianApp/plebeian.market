<script lang="ts">
	import Auth from '$lib/components/auth.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { logout } from '$lib/ndkLogin'
	import ndkStore from '$lib/stores/ndk'
</script>

<header class="sticky top-0 z-30 bg-black px-4 py-4 text-white lg:px-12">
	<div class="container flex h-full w-full items-center justify-between">
		<section class=" inline-flex items-center">
			<a href="/"><img src="/logo.svg" alt="logo" class="w-16 px-2" /></a>
			<div class="hidden lg:flex mx-8 gap-8">
				<a class="hover:underline font-semibold" href="/stalls/">Stall Browser</a>
				<a class="hover:underline font-semibold" href="/">Market Square</a>
				<a class="hover:underline font-semibold" href="/">Plebeian Planet</a>
			</div>
		</section>
		<div class="flex items-center gap-4">
			<Button class="hidden sm:flex p-2 bg-[var(--neo-yellow)]" href="/"><span class="i-tdesign-mail text-black w-6 h-6"></span></Button>
			<Button class="p-2 hidden sm:flex" href="/"><span class="i-tdesign-cart text-black w-6 h-6"></span></Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button class="p-2 bg-white"><span class="i-tdesign-view-list text-black w-6 h-6"></span></Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>
							{#if !$ndkStore.activeUser}
								<Auth />
							{:else}
								My account
							{/if}
						</DropdownMenu.Label>
						{#if $ndkStore.activeUser}
							<DropdownMenu.Separator />
							<DropdownMenu.Item>
								<a href={`/p/${$ndkStore.activeUser.pubkey}`} class="inline-flex items-center gap-2"
									><span class="i-tdesign-user-1" />Profile</a
								>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<Button variant="destructive" class="inline-flex items-center gap-2" on:click={() => logout()}
									><span class="i-tdesign-user-arrow-right"></span>Log out</Button
								>
							</DropdownMenu.Item>
						{/if}
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			{#if $ndkStore.activeUser}
				<Avatar>
					<AvatarImage src={$ndkStore.activeUser.profile?.image} alt="pfp" />
					<AvatarFallback>{$ndkStore.activeUser.profile?.name ?? $ndkStore.activeUser.profile?.displayName ?? ''}</AvatarFallback>
				</Avatar>
			{/if}
		</div>
	</div>
</header>
