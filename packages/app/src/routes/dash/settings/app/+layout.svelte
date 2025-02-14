<script lang="ts">
	import MustLogin from '$lib/components/assets/mustLogin.svelte'
	import Unauth from '$lib/components/assets/unauth.svelte'
	import { activeUserQuery } from '$lib/fetch/users.queries'
	import ndkStore from '$lib/stores/ndk'
</script>

{#if $ndkStore.activeUser?.pubkey}
	{#if $activeUserQuery.data?.role == 'admin'}
		<slot />
	{:else}
		<div class="flex justify-center p-24">
			<Unauth />
		</div>
	{/if}
{:else}
	<div class="flex justify-center p-24">
		<MustLogin />
	</div>
{/if}
