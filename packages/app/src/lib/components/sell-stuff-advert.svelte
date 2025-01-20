<script lang="ts">
	import { handleListItems } from '$lib/utils/product.utils'

	import Hero from './common/hero.svelte'
	import Button from './ui/button/button.svelte'
</script>

<Hero innerContainerClass=" flex flex-col items-center">
	<span class="mb-8 text-3xl font-heading">Join in on the fun!</span>

	<div class="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 mb-6 p-2">
		<img src="/buy-sell.svg" alt="Buy Sell Stuff for Sats" class="lg:h-[45px] w-auto" />
		<img src="/stuff-for-sats.svg" alt="Buy Sell Stuff for Sats" class="lg:h-[45px] w-auto" />
	</div>
	<Button variant="focus" class="relative z-10 w-fit" on:click={handleListItems}>
		<span class="flex items-center gap-2">
			<span class="i-game-icons-ostrich w-5 h-5"></span>Start Selling
		</span>
	</Button>
</Hero>
