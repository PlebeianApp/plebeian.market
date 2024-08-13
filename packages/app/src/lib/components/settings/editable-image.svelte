<script lang="ts">
	import { NostrBuildUploader } from '@nostrify/nostrify/uploaders'
	import * as Collapsible from '$lib/components/ui/collapsible'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import ndkStore, { NostrifyNDKSigner } from '$lib/stores/ndk'
	import { debounce } from '$lib/utils'
	import { createEventDispatcher } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Button from '../ui/button/button.svelte'
	import { Input } from '../ui/input'
	import UserImageHistory from './user-image-history.svelte'

	export let src: string | null
	export let marketContext: boolean = false

	const dispatch = createEventDispatcher()

	let imageChoiceDialogOpen = false
	let inputValue = ''
	let isLoading = false
	let urlError: string | null = null

	$: localSrc = inputValue && !urlError ? inputValue : null

	const handleUploadIntent = async () => {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'image/*'
		input.onchange = async (e) => {
			isLoading = true
			const file = (e.target as HTMLInputElement).files?.[0]
			if (file) {
				const uploader = new NostrBuildUploader({
					signer: new NostrifyNDKSigner($ndkStore),
				})
				const [[_, url]] = await uploader.upload(file)
				inputValue = url
				urlError = null
			}
			isLoading = false
		}
		input.click()
	}

	const validateAndSetImage = async (url: string) => {
		isLoading = true
		urlError = null

		if (!url.trim()) {
			isLoading = false
			return
		}

		try {
			new URL(url)
			const isValid = await new Promise<boolean>((resolve) => {
				const img = new Image()
				img.onload = () => resolve(true)
				img.onerror = () => resolve(false)
				img.src = url
			})

			if (!isValid) {
				urlError = 'Invalid image URL'
			}
		} catch (e) {
			urlError = 'Invalid URL format'
		}

		isLoading = false
	}

	const handleInput = (e: Event) => {
		const eValue = (e.target as HTMLInputElement).value
		try {
			new URL(eValue)
			inputValue = eValue
			validateAndSetImage(inputValue)
		} catch {
			return
		}
	}

	const handleSave = () => {
		if (localSrc) {
			dispatch('save', localSrc)
			imageChoiceDialogOpen = false
		}
	}

	const handleImageClick = (e: CustomEvent) => {
		inputValue = e.detail
		validateAndSetImage(inputValue)
	}
	$: if (!imageChoiceDialogOpen) {
		localSrc = null
		inputValue = ''
	}
</script>

<div class="relative w-full h-full border-2 border-black">
	{#if src}
		<img {src} alt="nip 96" class="w-full h-full object-cover" />
	{:else}
		<div class="w-full h-full min-h-[250px] flex items-center justify-center">
			<Button on:click={() => (imageChoiceDialogOpen = true)} variant="ghost">
				<span class="i-mdi-upload w-9 h-9" />
			</Button>
		</div>
	{/if}

	<Button on:click={() => (imageChoiceDialogOpen = true)} variant="ghost" class="absolute top-1 right-1 font-bold text-red-500 border-0">
		<span class="i-mdi-pencil-outline text-white w-6 h-6" />
	</Button>
	<Dialog.Root bind:open={imageChoiceDialogOpen}>
		<Dialog.Content class="max-w-[66vw]">
			<Dialog.Header>
				<Dialog.Title>Set a remote image url or upload a new one</Dialog.Title>
			</Dialog.Header>
			<div class="flex flex-col gap-4">
				{#if localSrc}
					<img src={localSrc} alt="nip 96" class="w-full max-h-[50vh] h-auto object-cover" />
				{/if}
				<div class="flex flex-row items-center">
					<Input
						type="text"
						id="userImageRemote"
						name="imageRemoteInput"
						on:input={debounce((e) => {
							handleInput(e)
						}, 300)}
					/>
					{#if isLoading}
						<Spinner />
					{/if}
				</div>
				{#if urlError}
					<p class="text-destructive">{urlError}</p>
				{/if}
				<div class="flex flex-row gap-2">
					<Button variant={'secondary'} on:click={handleUploadIntent} class="w-full font-bold">
						<span class="i-mdi-upload w-6 h-6" /> Upload
						{#if isLoading}
							<Spinner />
						{/if}
					</Button>
					<Button on:click={handleSave} class="w-full font-bold" disabled={!localSrc}>Save</Button>
				</div>
				{#if marketContext}
					<div class="flex-1 max-h-[40vh] overflow-y-auto">
						<Collapsible.Root>
							<Collapsible.Trigger>
								<Button type="button" class="text-bold">use an already uploaded photo</Button>
							</Collapsible.Trigger>
							<Collapsible.Content>
								<UserImageHistory on:imageClick={handleImageClick} />
							</Collapsible.Content>
						</Collapsible.Root>
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
