<script lang="ts">
	import AccordionContent from '$lib/components/ui/accordion/accordion-content.svelte'
	import Button from '$lib/components/ui/button/button.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import Textarea from '$lib/components/ui/textarea/textarea.svelte'

	const activeTab =
		'w-full font-bold border-b-2 border-black text-black data-[state=active]:border-b-primary data-[state=active]:text-primary'
</script>

<form class="flex flex-col gap-4">
	<Tabs.Root value="basic" class="p-4">
		<Tabs.List class="w-full justify-around bg-transparent">
			<Tabs.Trigger value="basic" class={activeTab}>Basic</Tabs.Trigger>
			<Tabs.Trigger value="categories" class={activeTab}>Categories</Tabs.Trigger>
			<Tabs.Trigger value="images" class={activeTab}>Images</Tabs.Trigger>
			<Tabs.Trigger value="shipping" class={activeTab}>Shipping</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="basic" class="flex flex-col gap-2">
			<div class="grid w-full items-center gap-1.5">
				<Label for="title" class="font-bold">Title</Label>
				<Input value={''} required class="border-2 border-black" type="text" name="title" placeholder="e.g. Fancy Wears" />
			</div>

			<div class="grid w-full items-center gap-1.5">
				<Label for="description" class="font-bold">Description (Optional)</Label>
				<Textarea value={''} class="border-2 border-black" placeholder="Description" name="description" />
			</div>

			<div class="flex gap-1.5">
				<div class="grid w-full items-center gap-1.5">
					<Label for="title" class="font-bold">Price</Label>
					<Input
						class="border-2 border-black"
						min={0}
						type="text"
						pattern="^(?!.*\\.\\.)[0-9]*([.][0-9]+)?"
						name="shipping"
						placeholder="e.g. $30"
					/>
				</div>

				<div class="grid w-full items-center gap-1.5">
					<Label for="quantity" class="font-bold">Quantity</Label>
					<Input value={''} required class="border-2 border-black" type="number" name="quantity" placeholder="0" />
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>

	<Button type="submit" class="w-full font-bold">Save</Button>
</form>
