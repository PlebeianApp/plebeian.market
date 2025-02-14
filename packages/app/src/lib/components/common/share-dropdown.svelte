<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import { Button } from '$lib/components/ui/button'
	import { Share } from 'lucide-svelte'
	import { copyToClipboard } from '$lib/utils'
	import { Twitter, Facebook, Link, Mail } from 'lucide-svelte'

	export let title: string = ''
	export let text: string = ''
	export let url: string = ''

	const shareToTwitter = () => {
		const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
		window.open(twitterUrl, '_blank')
	}

	const shareToFacebook = () => {
		const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
		window.open(facebookUrl, '_blank')
	}

	const shareViaEmail = () => {
		const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`
		window.location.href = emailUrl
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} size="icon" variant="primary">
			<Share class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-48">
		<DropdownMenu.Item class="cursor-pointer" on:click={shareToTwitter}>
			<Twitter class="h-4 w-4 mr-2" />
			Twitter
		</DropdownMenu.Item>
		<DropdownMenu.Item class="cursor-pointer" on:click={shareToFacebook}>
			<Facebook class="h-4 w-4 mr-2" />
			Facebook
		</DropdownMenu.Item>
		<DropdownMenu.Item class="cursor-pointer" on:click={shareViaEmail}>
			<Mail class="h-4 w-4 mr-2" />
			Email
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item class="cursor-pointer" on:click={() => copyToClipboard(url)}>
			<Link class="h-4 w-4 mr-2" />
			Copy link
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
