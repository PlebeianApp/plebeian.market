<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import { Box } from 'lucide-svelte'

	import CheckoutForm from './checkout-form.svelte'
	import Separator from './ui/separator/separator.svelte'
</script>

<div class="grid auto-cols-max grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2">
	<div>
		<Collapsible.Root open={true} class="w-full space-y-2 border-black border-2 p-2">
			<div class="flex items-center justify-between space-x-4 px-4">
				<h4 class="text-sm font-semibold">Merchant 1</h4>
				<Collapsible.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghost" size="sm" class="w-9 p-0 border-0">
						{#if builder['data-state'] === 'open'}
							<span class="i-tdesign-chevron-up" style="width: 1rem; height: 1rem; color: black;"></span>
						{:else}
							<span class="i-tdesign-chevron-down" style="width: 1rem; height: 1rem; color: black;"></span>
						{/if}
					</Button>
				</Collapsible.Trigger>
			</div>
			<Collapsible.Content class="space-y-2 p-4 flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<span class="font-semibold">Stall A</span>
					<Separator />
					<ul class="mt-2 text-sm">
						<li class="flex justify-between items-center">
							<div class="flex justify-between items-center gap-4">
								<Box />
								<span>Product 1</span>
							</div>
							<span>2,169,420 sats</span>
						</li>
					</ul>
					<Separator />
					<span>Shipping: Worldwide</span>
				</div>

				<span class="font-bold text-lg">Total: 2,169,420 sats</span>
			</Collapsible.Content>
		</Collapsible.Root>
	</div>

	<div class="flex flex-col gap-2">
		<h2>Order details</h2>
		<CheckoutForm />
	</div>
</div>
