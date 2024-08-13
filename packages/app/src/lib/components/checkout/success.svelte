<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte'
	import { CheckCircle } from 'lucide-svelte'
</script>

<div class="flex flex-col items-center justify-center h-full gap-8">
	<CheckCircle class="w-24 h-24 mt-8" />
	<span class="text-xl">Your order has been sent successfully!</span>

	<Button>Continue <span class="ml-2 i-tdesign-arrow-right"></span></Button>
</div>
