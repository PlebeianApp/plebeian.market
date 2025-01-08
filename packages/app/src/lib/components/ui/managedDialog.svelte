<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import { cn } from '$lib/utils'

	export let open = false
	export let onClose: () => void
	export let onAction: () => void
	export let size: 'sm' | 'lg' | 'xl' = 'sm'

	const sizeClasses = {
		sm: 'max-w-sm',
		lg: 'max-w-lg',
		xl: 'max-w-2xl',
	}

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			onClose()
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class={cn('p-0 overflow-hidden', sizeClasses[size])}>
		<slot {onAction} />
	</Dialog.Content>
</Dialog.Root>
