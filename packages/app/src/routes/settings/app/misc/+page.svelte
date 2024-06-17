<script lang="ts">
	import type { Selected } from 'bits-ui'
	import type { ZodError } from 'zod'
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
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
	import { copyToClipboard, nav_back } from '$lib/utils'
	import { npubEncode } from 'nostr-tools/nip19'
	import { onMount, tick } from 'svelte'
	import { toast } from 'svelte-sonner'

	export let data
	const { adminUsers, currencies, appSettings } = data
	const linkDetails = data.menuItems.find((item) => item.value === 'app-settings')?.links.find((item) => item.href === $page.url.pathname)
	let checked = appSettings.allowRegister
	let selectedCurrency: Selected<string> = { value: 'BTC', label: 'BTC' }
	let adminsList: string[] = adminUsers.map((user) => npubEncode(user))
	let inputValue: string = ''
	let logoUrl: string = ''
	let open = false

	async function handleSubmit(event: SubmitEvent) {
		const formData = new FormData(event.currentTarget as HTMLFormElement)
		const formObject = Object.fromEntries(formData.entries())
		formObject.allowRegister = checked.toString()
		formObject.defaultCurrency = selectedCurrency.value
		formObject.logoUrl = logoUrl
		formObject.instancePk = npubEncode(appSettings.instancePk)
		const filteredFormObject = Object.fromEntries(Object.entries(formObject).filter(([_, value]) => value !== ''))

		const response = await fetch($page.url.pathname, {
			method: 'PUT',
			body: JSON.stringify(filteredFormObject),
		})

		if (!response.ok) {
			const error = (await response.json()) as ZodError
			console.log('error', error)
			if (error.issues.length > 0) {
				error.issues.forEach((issue) => {
					toast.error(issue.message)
				})
			} else {
				console.error('Failed to submit form', error)
			}
			return
		}

		const result = await response.json()

		if (result) {
			toast.success('App settings successfully updated!')
			invalidateAll()
		}
	}
	function closeAndFocusTrigger(triggerId: string) {
		open = false
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}

	onMount(() => {
		logoUrl = appSettings.logoUrl
		selectedCurrency = { value: appSettings.defaultCurrency, label: appSettings.defaultCurrency }
	})
</script>

<div class="pb-4 space-y-2 max-w-2xl">
	<div>
		<div class=" flex items-center gap-1">
			<Button size="icon" variant="outline" class=" border-none" on:click={() => nav_back()}>
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
								on:click={() => copyToClipboard(appSettings.instancePk)}
							>
								<code class="truncate">{npubEncode(appSettings.instancePk)}</code>
								<span class=" i-tdesign-copy"></span>
							</Button>
						</div>

						<Label class="truncate font-bold">Owner npub</Label>
						<Input
							value={appSettings.ownerPk ? npubEncode(appSettings.ownerPk) : ''}
							class=" border-black border-2"
							name="ownerPk"
							placeholder="owner npub"
							type="text"
						/>
						<div class=" flex-grow">
							<Label class="truncate font-bold">Instance name</Label>
							<Input
								value={appSettings.instanceName}
								class="border-black border-2"
								name="instanceName"
								placeholder="instance name"
								type="text"
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
											{#if appSettings.logoUrl}
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
							value={appSettings.contactEmail}
							class="border-black border-2"
							name="contactEmail"
							placeholder="contact email"
							type="email"
						/>
						<Separator class=" my-2" />
						<h3>Crew</h3>
						{#each adminsList as admin}
							{#if admin != npubEncode(appSettings.instancePk)}
								<div class=" grid grid-cols-[1fr_auto] items-center">
									<span class="truncate">{admin}</span>
									<Button
										type="button"
										size="icon"
										variant="outline"
										class=" bg-red-500"
										on:click={() => (adminsList = adminsList.filter((value) => value !== admin))}
									>
										<span class="i-mdi-trash-can"></span>
									</Button>
								</div>
							{/if}
						{/each}
						<textarea name="adminsList" value={adminsList} hidden />
						<Input type="text" bind:value={inputValue} />
						<Button
							type="button"
							on:click={() => {
								inputValue = inputValue.trim()
								if (inputValue) {
									adminsList = [...adminsList, inputValue]
									inputValue = ''
								}
							}}
						>
							Add Admin
						</Button>

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
								<Label class="truncate font-bold">Allow register</Label>
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
