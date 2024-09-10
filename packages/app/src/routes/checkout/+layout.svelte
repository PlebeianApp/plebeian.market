<script lang="ts">
	import MustLogin from '$lib/components/assets/mustLogin.svelte'
	import ndkStore from '$lib/stores/ndk'
</script>

{#if $ndkStore.activeUser}
	<slot />
{:else}
	<div class="flex justify-center p-24">
		<MustLogin />
	</div>
{/if}
