<script lang="ts">
	import type { Selected } from 'bits-ui'
	import { enhance } from '$app/forms'
	import Button from '$lib/components/ui/button/button.svelte'
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { copyToClipboard } from '$lib/utils'
	import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'

	import type { PageData } from './$types'

	let checked = false
	let innerText: Selected<string> = { value: '', label: '' }
	let newSk = ''
	let newInstanceNsec = ''
	let newInstanceNpub = ''

	export let data: PageData
	$: ({ currencies } = data)

	function setGeneratedSk() {
		const sk = generateSecretKey()
		const newPk = getPublicKey(sk)

		newInstanceNsec = nip19.nsecEncode(sk)
		newInstanceNpub = nip19.npubEncode(newPk)
	}
</script>

<div class="px-4 py-20 lg:px-12 min-h-[100vh]">
	<div class="mx-auto max-w-2xl flex flex-col gap-2">
		<main class="text-black">
			<div class="px-4 py-20 lg:px-12">
				<div class="container">
					<h2 class="max-w-2xl">GM ser, plase provide the setup data...</h2>
					<form method="POST" action="?/submitSetupData" class="max-w-2xl flex flex-col gap-3" use:enhance>
						<Label class="truncate font-bold">Instance npub</Label>
						<div class="flex flex-row gap-2">
							<Input
								required
								bind:value={newInstanceNpub}
								class=" border-black border-2"
								name="instance_npub"
								placeholder="instance npub"
								type="text"
							/>
							<Button
								on:click={() => {
									setGeneratedSk()
								}}>Generate</Button
							>
						</div>

						{#if newInstanceNsec}
							<Label class="truncate font-bold">New nsec</Label>
							<div class="flex flex-row gap-2">
								<Input class="border-black border-2" value={newInstanceNsec} readonly />
								<Button
									on:click={() => {
										copyToClipboard(newInstanceNsec)
									}}><span class="i-mingcute-clipboard-fill text-black w-6 h-6"></span></Button
								>
							</div>
							<Label class="truncate font-bold">Owner npub</Label>
							<Input required class=" border-black border-2" name="owner_npub" placeholder="owner npub" type="text" />
						{/if}

						<Label class="truncate font-bold">Owner npub</Label>
						<Input required class=" border-black border-2" name="owner_npub" placeholder="owner npub" type="text" />

						<Separator class=" my-8" />
						<div class="flex flex-row gap-2">
							<div class=" flex-grow">
								<Label class="truncate font-bold">Instance name</Label>
								<Input required class="border-black border-2" name="instance_name" placeholder="instance name" type="text" />
							</div>

							<div class=" flex-grow">
								<Label class="truncate font-bold">Logo url</Label>
								<Input class="border-black border-2" name="logo_url" placeholder="logo url" type="url" />
							</div>
						</div>

						<Label class="truncate font-bold">Contact email</Label>
						<Input class="border-black border-2" name="contact_email" placeholder="contact email" type="email" />

						<div class="flex flex-row items-center justify-center gap-4">
							<div class="flex-grow">
								<Label class="truncate font-bold">Default currency</Label>
								<Select name="currency" selected={innerText}>
									<SelectTrigger class="border-black border-2">
										<SelectValue placeholder="Currency" />
									</SelectTrigger>
									<SelectContent>
										{#each currencies as currency}
											<SelectItem value={currency}>{currency}</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</div>
							<div class="flex flex-col items-center justify-center gap-3">
								<Label class="truncate font-bold">Allow register</Label>
								<Checkbox required class="border-black border-2" name="allow_register" bind:checked placeholder="allow register" />
							</div>
						</div>

						<Separator class="max-w-2xl my-8" />

						<Button type="submit" class="w-full">Submit</Button>
					</form>
				</div>
			</div>
		</main>
	</div>
</div>
