<script lang="ts">
	import type { Selected } from 'bits-ui'
	import { goto, invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { processAppSettings, submitAppSettings } from '$lib/appSettings.js'
	import { Button } from '$lib/components/ui/button'
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte'
	import * as Command from '$lib/components/ui/command/index.js'
	import Input from '$lib/components/ui/input/input.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import * as Popover from '$lib/components/ui/popover/index.js'
	import { Select, SelectValue } from '$lib/components/ui/select/index.js'
	import SelectContent from '$lib/components/ui/select/select-content.svelte'
	import SelectItem from '$lib/components/ui/select/select-item.svelte'
	import SelectTrigger from '$lib/components/ui/select/select-trigger.svelte'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import { availabeLogos } from '$lib/constants'
	import { copyToClipboard } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount, tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	export let data
	const { adminUsers, currencies, appSettings } = data
	const linkDetails = data.menuItems.find((item) => item.value === 'app-settings')?.links.find((item) => item.href === $page.url.pathname)
	let checked = appSettings?.allowRegister
	let selectedCurrency: Selected<string> = { value: 'BTC', label: 'BTC' }
	let logoUrl: string = ''
	let open = false

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const formObject = Object.fromEntries(formData)

		try {
			const processedData = processAppSettings(
				{
					...formObject,
					allowRegister: checked,
					defaultCurrency: selectedCurrency.value,
					logoUrl: logoUrl || undefined,
					// Only include instancePk if it exists in the original appSettings
					...(data.appSettings?.instancePk ? { instancePk: data.appSettings.instancePk } : {}),
				},
				false,
			)
			await submitAppSettings(processedData, false)
			toast.success('App settings successfully updated!')
			invalidateAll()
		} catch (e) {
			console.error('Failed to submit form', e)
			if (e instanceof Error && e.message) {
				try {
					const errors = JSON.parse(e.message)
					if (Array.isArray(errors)) {
						errors.forEach((error) => toast.error(error.message))
					} else {
						toast.error(e.message)
					}
				} catch {
					toast.error(e.message)
				}
			} else {
				toast.error('An unknown error occurred')
			}
		}
	}

	function closeAndFocusTrigger(triggerId: string) {
		open = false
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}

	onMount(() => {
		logoUrl = appSettings?.logoUrl ?? ''
		selectedCurrency = { value: appSettings?.defaultCurrency ?? 'BTC', label: appSettings?.defaultCurrency }
	})
</script>

<div class="pb-4 space-y-2 max-w-2xl">
	<div>
		<div class=" flex items-center gap-1">
			<Button size="icon" variant="outline" class=" border-none" on:click={() => goto('/settings/app')}>
				<span class="cursor-pointer i-tdesign-arrow-left w-6 h-6" />
			</Button>
			<section>
				<h3 class="text-lg font-bold">{linkDetails?.title}</h3>
				<p class="text-gray-600">{linkDetails?.description}</p>
			</section>
		</div>
	</div>
	<div class="flex flex-col gap-2 overflow-auto">
		<main class="text-black">
			<div class="">
				<div class="container">
					<Separator class=" my-2" />
					<form on:submit|preventDefault={handleSubmit} class="max-w-2xl flex flex-col gap-3">
						<h3>Identity</h3>
						<Label class="truncate font-bold">Instance npub</Label>
						<div>
							<Button
								variant="outline"
								class="flex gap-1 p-2 border-black border-2"
								on:click={() => copyToClipboard(appSettings?.instancePk ?? '')}
							>
								<code class="truncate">{npubEncode(appSettings?.instancePk)}</code>
								<span class=" i-tdesign-copy"></span>
							</Button>
						</div>

						<Label class="truncate font-bold">Owner npub</Label>
						<Input
							value={appSettings?.ownerPk ? npubEncode(appSettings?.ownerPk) : ''}
							class=" border-black border-2"
							name="ownerPk"
							placeholder="owner npub"
							type="text"
						/>
						<div class=" flex-grow">
							<Label class="truncate font-bold required-mark">Instance name</Label>
							<Input
								value={appSettings?.instanceName}
								class="border-black border-2"
								name="instanceName"
								placeholder="instance name"
								type="text"
								required
							/>
						</div>

						<div class=" flex flex-col gap-2">
							<div>
								<Label class="truncate font-bold">Logo url</Label>
								<Popover.Root bind:open let:ids>
									<Popover.Trigger asChild let:builder>
										<Button
											builders={[builder]}
											variant="outline"
											role="combobox"
											aria-expanded={open}
											class="w-full justify-between border-black border-2"
										>
											{#if appSettings?.logoUrl}
												{availabeLogos.find((logo) => logo.value === logoUrl)?.label || logoUrl}
											{:else}
												<span class=" opacity-50">Select logo</span>
											{/if}
										</Button>
									</Popover.Trigger>
									<Popover.Content class=" p-0">
										<Command.Root>
											<Command.Input placeholder="Select logo or introduce image url..." bind:value={logoUrl} />
											<Command.Group>
												{#each availabeLogos as logo}
													<Command.Item
														value={logo.value}
														onSelect={(currentValue) => {
															logoUrl = currentValue
															closeAndFocusTrigger(ids.trigger)
														}}
													>
														+
														{logo.label}
													</Command.Item>
												{/each}
											</Command.Group>
										</Command.Root>
									</Popover.Content>
								</Popover.Root>
							</div>
							<div class="self-center">
								{#if logoUrl}
									<img
										class=" max-w-28"
										src={logoUrl}
										alt="logo preview"
										on:error={(e) => {
											if (e.target instanceof HTMLImageElement) {
												e.target.src = availabeLogos[0].value
											}
										}}
									/>
								{/if}
							</div>
						</div>
						<Label class="truncate font-bold">Contact email</Label>
						<Input
							value={appSettings?.contactEmail}
							class="border-black border-2"
							name="contactEmail"
							placeholder="contact email"
							type="email"
						/>
						<Separator class=" my-2" />
						<h3>Miscellanea</h3>
						<div class="flex flex-row items-center justify-center gap-4">
							<div class="flex-grow">
								<Label class="truncate font-bold">Default currency</Label>
								<Select bind:selected={selectedCurrency} name="defaultCurrency">
									<SelectTrigger class="border-black border-2">
										<SelectValue placeholder="Currency" />
									</SelectTrigger>
									<SelectContent class="border-black border-2 max-h-[350px] overflow-y-auto">
										{#each currencies as currency}
											<SelectItem value={currency}>{currency}</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</div>
							<div class="flex flex-col items-center justify-center gap-3">
								<Label class="truncate font-bold required-mark">Allow register</Label>
								<Checkbox required class="border-black border-2" name="allowRegister" bind:checked placeholder="allow register" />
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
