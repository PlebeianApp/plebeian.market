<script lang="ts">
	import { browser } from '$app/environment'
	import { Button } from '$lib/components/ui/button'
	import { Card } from '$lib/components/ui/card'
	import { onDestroy } from 'svelte'
	import { useRegisterSW } from 'virtual:pwa-register/svelte'

	const UPDATE_INTERVAL = 60 * 60 * 1000
	let updateInterval: ReturnType<typeof setInterval>

	const { needRefresh, updateServiceWorker } = useRegisterSW({
		onRegistered(r) {
			if (!r || !browser) return

			const checkUpdate = async () => {
				try {
					if (!navigator.onLine) return
					console.log('Checking for sw update')
					await r.update()
				} catch (error) {
					console.error('SW update check failed:', error)
				}
			}

			checkUpdate()

			updateInterval = setInterval(checkUpdate, UPDATE_INTERVAL)
		},
		onRegisterError(error) {
			console.error('SW registration error', error)
		},
	})

	onDestroy(() => {
		if (updateInterval) clearInterval(updateInterval)
	})

	function close() {
		needRefresh.set(false)
	}
</script>

{#if $needRefresh}
	<Card class="fixed bottom-4 right-4 p-3 z-10 text-left" role="alert">
		<div class="mb-2">
			<span>New version available, click on reload button to update.</span>
		</div>
		<div class="flex gap-2">
			<Button variant="focus" on:click={() => updateServiceWorker(true)}>Reload</Button>
			<Button variant="tertiary" on:click={close}>Close</Button>
		</div>
	</Card>
{/if}
