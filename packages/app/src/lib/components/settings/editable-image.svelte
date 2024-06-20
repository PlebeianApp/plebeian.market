<script lang="ts">
	import { NostrBuildUploader } from '@nostrify/nostrify/uploaders'
	import * as Dialog from '$lib/components/ui/dialog/index.js'
	import ndkStore from '$lib/stores/ndk'
	import { createEventDispatcher } from 'svelte'
	import { writable } from 'svelte/store'

	import Spinner from '../assets/spinner.svelte'
	import Button from '../ui/button/button.svelte'
	import { Input } from '../ui/input'
	import UserImageHistory from './user-image-history.svelte'

	export let src: string | null
	export let marketKontext: boolean = false

	const dispatch = createEventDispatcher()

	let imageChoiceDialogOpen = writable(false)
	let localSrc = writable(src)
	let inputValue = writable('')

	let uploading = writable(false)
	let checkingImage = writable(false)

	let urlError = writable<string | null>(null)

	const handleUploadIntent = async () => {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'image/*'
		input.onchange = async (e) => {
			uploading.set(true)
			const target = e.target as HTMLInputElement
			const file = target.files?.[0]
			if (file) {
				const uploader = new NostrBuildUploader({
					signer: ndkStore.activeUser?.signer,
				})
				const [[_, url], ...tags] = await uploader.upload(file)
				console.log(url, tags)
				localSrc.set(url)
				inputValue.set(url)
			}
			uploading.set(false)
		}
		input.click()
	}

	const isValidUrl = (url: string) => {
		try {
			new URL(url)
			urlError.set(null)
			return true
		} catch (e) {
			urlError.set('Invalid URL format')
			return false
		}
	}

	const validateImageUrl = async (url: string) => {
		return new Promise<boolean>((resolve) => {
			const img = new Image()
			img.onload = () => resolve(true)
			img.onerror = () => resolve(false)
			img.src = url
		})
	}

	const handleInput = async (e: Event) => {
		checkingImage.set(true)
		const input = e.target as HTMLInputElement
		const newImageSrc = input.value

		if (!isValidUrl(newImageSrc)) {
			console.error('Invalid URL format')
			checkingImage.set(false)
			return
		}

		const isValidImage = await validateImageUrl(newImageSrc)
		if (isValidImage) {
			localSrc.set(newImageSrc)
		} else {
			console.error('Invalid image URL')
		}
		checkingImage.set(false)
	}

	const handleSave = () => {
		console.log('saving', $localSrc)
		dispatch('save', $localSrc)
		imageChoiceDialogOpen.set(false)
	}

	const handleImageCLick = async (e: CustomEvent) => {
		checkingImage.set(true)
		const imageUrl = e.detail

		inputValue.set(imageUrl)

		if (!isValidUrl(imageUrl)) {
			console.error('Invalid URL format')
			checkingImage.set(false)
			return
		}

		const isValidImage = await validateImageUrl(imageUrl)
		if (isValidImage) {
			localSrc.set(imageUrl)
		} else {
			console.error('Invalid image URL')
		}
		checkingImage.set(false)
	}
</script>

<div class="relative w-full h-full border-2 border-black">
	{#if src}
		<img {src} alt="nip 96" class="w-full h-full object-cover" />
	{:else}
		<div class="w-full h-full min-h-[200px] flex items-center justify-center">
			<Button on:click={() => imageChoiceDialogOpen.set(true)} variant="ghost"><span class="i-mdi-upload w-9 h-9" /></Button>
		</div>
	{/if}

	<Button on:click={() => imageChoiceDialogOpen.set(true)} variant="ghost" class="absolute top-1 right-1 font-bold text-red-500 border-0"
		><span class="i-mdi-pencil-outline text-white w-6 h-6" /></Button
	>

	<Dialog.Root bind:open={$imageChoiceDialogOpen}>
		<Dialog.Content class="max-w-[66vw]">
			<Dialog.Header>
				<Dialog.Title>Set a remote image url or upload a new one {src}</Dialog.Title>
			</Dialog.Header>
			<div class="flex flex-row gap-4">
				<div class="flex-1 flex flex-col gap-4">
					{#if $localSrc}
						<img src={$localSrc} alt="nip 96" class="w-full max-h-[50vh] h-auto object-cover" />
					{/if}
					<div class="flex flex-row">
						<Input type="text" id="userImageRemote" name="imageRemoteInput" bind:value={$inputValue} on:input={handleInput} />
						{#if $checkingImage}
							<Spinner />
						{/if}
					</div>
					{#if $urlError}
						<p class="text-destructive">{$urlError}</p>
					{/if}
					<div class="flex flex-row gap-2">
						<Button variant={'secondary'} on:click={handleUploadIntent} class="w-full font-bold">
							<span class="i-mdi-upload w-6 h-6" />{' '}
							Upload
							{#if $uploading}
								<Spinner />
							{/if}</Button
						>
						<Button on:click={handleSave} class="w-full font-bold">Save</Button>
					</div>
				</div>
				{#if marketKontext}
					<div class="flex-1 max-h-[40vh] overflow-y-auto">
						<div class="text-bold">History</div>
						<UserImageHistory on:imageClick={(e) => handleImageCLick(e)} />
					</div>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>
</div>
