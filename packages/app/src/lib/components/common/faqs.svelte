<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte'
	import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible'

	import Separator from '../ui/separator/separator.svelte'
	import { faqItems } from './faqs'

	let openStates = Array(faqItems.length).fill(false)
</script>

<div class="space-y-4">
	{#each faqItems as faq, index}
		<div class="shadow-md">
			<Collapsible bind:open={openStates[index]}>
				<CollapsibleTrigger asChild let:builder>
					<Button builders={[builder]} variant="ghost" size="sm" iconPosition="right" class="w-full justify-between bg-white">
						<span class="text-base font-bold">{faq.question}</span>
						<span class="i-ion-chevron-down h-4 w-4 transition-transform duration-200" class:rotate-180={openStates[index]} />
					</Button>
				</CollapsibleTrigger>

				<CollapsibleContent>
					<Separator />
					<div class="p-4 bg-white">
						{#if faq.component}
							<svelte:component this={faq.component} />
						{:else if faq.answer}
							<p>{faq.answer}</p>
						{/if}
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	{/each}
</div>
