<script lang="ts">
	import Auth from '$lib/components/auth.svelte'
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar'
	import { Button } from '$lib/components/ui/button/index.js'
	import ndk from '$lib/stores/ndk'
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
			<Auth />
			{#if $ndk.activeUser}
				<Avatar>
					<AvatarImage src={$ndk.activeUser.profile?.image} alt="@shadcn" />
					<AvatarFallback>{$ndk.activeUser.profile?.name ?? $ndk.activeUser.profile?.displayName}</AvatarFallback>
				</Avatar>
			{/if}
		</div>
	</div>
</header>
