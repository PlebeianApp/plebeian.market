<script lang="ts">
	import { NostrBuildUploader } from '@nostrify/nostrify/uploaders'
	import ndkStore, { NostrifyNDKSigner } from '$lib/stores/ndk'
	import { createEventDispatcher } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Pattern from '../Pattern.svelte'
	import Button from '../ui/button/button.svelte'
	import { Input } from '../ui/input'

	export let src: string | null = null
	export let index: number
	export let imagesLength: number

	const dispatch = createEventDispatcher()

	let isLoading = false
	let urlError: string | null = null
	let inputTimeout: ReturnType<typeof setTimeout>
	let inputField: HTMLInputElement
	let inputEditable = false

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
				dispatch('save', { url, index }) // For new images, just send the URL
				src = null
				if (inputField) {
					inputField.value = ''
				}
			}
			isLoading = false
		}
		input.click()
	}

	const handleEditByUpload = async () => {
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
				dispatch('save', { url, index })
				if (inputField) {
					inputField.value = ''
				}
			}
			isLoading = false
		}
		input.click()
	}

	function handleInput(event: Event): void {
		clearTimeout(inputTimeout)
		inputTimeout = setTimeout(() => {
			const target = event.target as HTMLInputElement
			try {
				new URL(target.value)
				const newUrl = target.value
				urlError = null
				dispatch('save', { url: newUrl, index })
				if (inputField) {
					inputField.value = ''
				}
				// target.value = ''
			} catch {
				urlError = 'Invalid URL format'
			}
		}, 300)
	}

	function handleSaveImage() {
		if (!src) return
		dispatch('save', { url: src, index })

		if (inputEditable) {
			inputEditable = false
		}
	}
</script>

<div class="w-full h-full">
	<div class="flex flex-col">
		<div
			class="border-t-2 border-l-2 border-r-2 border-black relative w-full aspect-[3/1] overflow-hidden
			{src
				? 'bg-black'
				: 'bg-[#F5F5F5] bg-[linear-gradient(45deg,#E0E0E0_25%,transparent_25%,transparent_75%,#E0E0E0_75%,#E0E0E0),linear-gradient(45deg,#E0E0E0_25%,transparent_25%,transparent_75%,#E0E0E0_75%,#E0E0E0)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]'}"
		>
			{#if src}
				<Pattern />
				<div class="absolute inset-0 flex items-center justify-center">
					<img {src} alt="nip 96" class="max-w-full max-h-full object-contain" />
				</div>
				<div class="absolute bottom-2 right-2 flex gap-2">
					{#if inputEditable}
						<Button variant="tertiary" size="icon" on:click={handleEditByUpload}>
							<span class="i-mdi-upload w-6 h-6" />
						</Button>
					{/if}
					<Button variant="tertiary" size="icon" on:click={() => dispatch('delete', index)}>
						<span class="i-mdi-delete w-4 h-4" />
					</Button>
				</div>
				{#if index !== -1}
					<div class="absolute left-2 bottom-2 flex flex-row gap-2">
						<Button variant="tertiary" size="icon" disabled={index === 0} on:click={() => dispatch('promote', index)}>
							<span class="i-mdi-chevron-up w-4 h-4" />
						</Button>
						<Button variant="tertiary" size="icon" disabled={index === imagesLength - 1} on:click={() => dispatch('demote', index)}>
							<span class="i-mdi-chevron-down w-4 h-4" />
						</Button>
					</div>
				{/if}
			{:else}
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="flex flex-col items-center gap-2">
						<Button variant="outline" size="icon" on:click={handleUploadIntent}>
							<span class="i-mdi-upload w-6 h-6" />
						</Button>
						<strong>Upload more images</strong>
					</div>
				</div>
			{/if}
		</div>
		<div class="w-full flex items-center justify-center">
			<Input
				disabled={!inputEditable && Boolean(src)}
				value={src}
				type="text"
				class="border-2 border-black"
				placeholder="Or paste image URL..."
				id="userImageRemote"
				name="imageRemoteInput"
				on:input={handleInput}
			/>
			{#if src}
				{#if inputEditable}
					<Button variant="primary" on:click={handleSaveImage}>Save</Button>
				{:else}
					<Button variant="secondary" on:click={() => (inputEditable = true)}>Edit</Button>
				{/if}
			{:else}
				<Button variant="primary" on:click={handleSaveImage}>Save</Button>
			{/if}
		</div>
		{#if urlError}
			<p class="text-destructive">{urlError}</p>
		{/if}
		{#if isLoading}
			<div class="flex flex-row gap-2">
				<Spinner />
				<p>Loading...</p>
			</div>
		{/if}
	</div>
</div>
