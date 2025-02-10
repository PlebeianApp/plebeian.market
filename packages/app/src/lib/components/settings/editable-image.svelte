<script lang="ts">
	import { NostrBuildUploader } from '@nostrify/nostrify/uploaders'
	import ndkStore, { NostrifyNDKSigner } from '$lib/stores/ndk'
	import { getMediaType } from '$lib/utils/media.utils'
	import { createEventDispatcher } from 'svelte'

	import Spinner from '../assets/spinner.svelte'
	import Pattern from '../Pattern.svelte'
	import Button from '../ui/button/button.svelte'
	import { Input } from '../ui/input'

	export let src: string | null = null
	export let index: number
	export let imagesLength: number
	export let forSingle: boolean = false

	const dispatch = createEventDispatcher()

	let isLoading = false
	let urlError: string | null = null
	let inputTimeout: ReturnType<typeof setTimeout>
	let inputEditable = false
	let isDragging = false

	const handleUploadIntent = async () => {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'image/*,video/*'
		input.multiple = !forSingle
		input.onchange = async (e) => {
			isLoading = true
			const files = Array.from((e.target as HTMLInputElement).files || [])
			if (files.length) {
				const uploader = new NostrBuildUploader({
					signer: new NostrifyNDKSigner($ndkStore),
				})

				const results = await Promise.all(files.map((file) => uploader.upload(file)))

				const urls = results
					.map((fileData: [[string, string], [string, string]]) => {
						const urlEntry = fileData.find((entry: [string, string]) => entry[0] === 'url')
						if (!urlEntry) return null
						return urlEntry[1]
					})
					.filter(Boolean)

				const urlsToProcess = forSingle ? urls.slice(0, 1) : urls
				urlsToProcess.forEach((url: string) => {
					dispatch('save', { url, index: -1 })
				})

				src = null
			}
			isLoading = false
		}
		input.click()
	}

	function handleDragEnter(e: DragEvent) {
		e.preventDefault()
		isDragging = true
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault()
		isDragging = false
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault()
		isDragging = false

		const files = Array.from(e.dataTransfer?.files || [])
		const mediaFiles = files
			.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
			.filter((file) => !file.type.includes('svg'))

		const filesToProcess = forSingle ? mediaFiles.slice(0, 1) : mediaFiles

		if (filesToProcess.length) {
			isLoading = true
			const uploader = new NostrBuildUploader({
				signer: new NostrifyNDKSigner($ndkStore),
			})

			Promise.all(filesToProcess.map((file) => uploader.upload(file)))
				.then((results) => {
					const urls = results
						.map((fileData: [[string, string], [string, string]]) => {
							const urlEntry = fileData.find((entry: [string, string]) => entry[0] === 'url')
							if (!urlEntry) return null
							return urlEntry[1]
						})
						.filter(Boolean)

					urls.forEach((url: string) => {
						dispatch('save', { url, index: -1 })
					})

					src = null
				})
				.finally(() => {
					isLoading = false
				})
		}
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
				src = null
			}
			isLoading = false
		}
		input.click()
	}

	function handleInput(event: Event): void {
		clearTimeout(inputTimeout)
		inputTimeout = setTimeout(() => {
			const target = event.target as HTMLInputElement
			if (!target.value.trim()) {
				urlError = null
				return
			}
			try {
				new URL(target.value)
				const newUrl = target.value
				urlError = null
				dispatch('save', { url: newUrl, index })
				src = null
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
				: 'bg-[#F5F5F5] bg-[linear-gradient(45deg,#E0E0E0_25%,transparent_25%,transparent_75%,#E0E0E0_75%,#E0E0E0),linear-gradient(45deg,#E0E0E0_25%,transparent_25%,transparent_75%,#E0E0E0_75%,#E0E0E0)] bg-[length:50px_50px] bg-[position:0_0,25px_25px]'}"
		>
			{#if src}
				<Pattern />
				<div class="absolute inset-0 flex items-center justify-center">
					{#if getMediaType(src) === 'video'}
						<video {src} controls class="max-w-full max-h-full object-contain">
							<track kind="captions" />
							Your browser does not support the video tag.
						</video>
					{:else}
						<img {src} alt="nip 96" class="max-w-full max-h-full object-contain" />
					{/if}
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
				<button
					type="button"
					class="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/5 {isDragging
						? 'bg-black/10'
						: ''}"
					on:click={handleUploadIntent}
					on:dragenter={handleDragEnter}
					on:dragover|preventDefault
					on:dragleave={handleDragLeave}
					on:drop={handleDrop}
				>
					<span class="i-mdi-upload w-6 h-6" />
					<strong>{isDragging ? 'Drop media here' : 'Upload images or videos'}</strong>
				</button>
			{/if}
		</div>
		<div class="w-full flex items-center justify-center">
			<div class="relative w-full">
				<Input
					disabled={!inputEditable && Boolean(src)}
					bind:value={src}
					type="text"
					class="border-2 border-black pr-12 h-12"
					placeholder="Or paste image/video URL..."
					id="userImageRemote"
					name="imageRemoteInput"
					on:input={handleInput}
				/>
				{#if src}
					{#if inputEditable}
						<Button variant="primary" class="absolute right-1 top-1 bottom-1 h-10" on:click={handleSaveImage}>Save</Button>
					{:else}
						<Button variant="secondary" class="absolute right-1 top-1 bottom-1 h-10" on:click={() => (inputEditable = true)}>Edit</Button>
					{/if}
				{:else}
					<Button variant="primary" class="absolute right-1 top-1 bottom-1 h-10" on:click={handleSaveImage}>Save</Button>
				{/if}
			</div>
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
