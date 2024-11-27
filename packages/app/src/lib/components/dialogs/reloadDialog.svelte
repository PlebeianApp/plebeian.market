<script lang="ts">
    import { useRegisterSW } from 'virtual:pwa-register/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
  
    const { needRefresh, updateServiceWorker } = useRegisterSW({
      onRegistered(swr) {
        console.log(`SW registered: ${swr}`);
      },
      onRegisterError(error) {
        console.log('SW registration error', error);
      }
    });
  
    function close() {
      needRefresh.set(false)
    }
  
    $: toast = $needRefresh
  </script>
  
  {#if toast}
    <Card class="fixed bottom-4 right-4 p-3 z-10 text-left" role="alert">
        <div class="mb-2">
            <span>New content available, click on reload button to update.</span>
        </div>
        {#if $needRefresh}
            <Button variant="outline" on:click={() => updateServiceWorker(true)}>
                Reload
            </Button>
        {/if}
        <Button variant="outline" on:click={close}>
            Close
        </Button>
    </Card>
  {/if}