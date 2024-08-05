<script lang="ts">
  interface $$Slots {
    // we don't want to render a default slot
    default: never
    // the named slot exposes no variables (use an empty object)
    // we have to use the `$$Slots` interface if we have two slots with the same name exposing differently typed props
    'conditional-slot': { valid?: string; invalid?: string }
		[k: string]: {}
  }
  export let currentStep = 0;

  const isComplete = (index: number) => index < currentStep;
  const isActive = (index: number) => index === currentStep;

  let steps = [];

  $: steps = [...$$slots];

  const getStepLabel = (index) => {
    return steps[index] && steps[index].label ? steps[index].label : `Step ${index + 1}`;
  };
</script>

<div class="w-full flex items-center">
  {#each steps as _, index}
    <div class="flex items-center">
      <div class="relative">
        <div class={`w-8 h-8 flex items-center justify-center rounded-full ${isComplete(index) ? 'bg-green-500' : 'bg-gray-200'} ${isActive(index) ? 'ring-4 ring-green-200' : ''}`}>
          {index + 1}
        </div>
				{#if index < steps.length - 1}
        	<div class="absolute top-1/2 w-full border-t-2 border-gray-200 left-8"></div>
        {/if}
      </div>
      <div class="ml-2">{getStepLabel(index)}</div>
    </div>
  {/each}
</div>

<div class="w-full bg-gray-200 rounded-full h-2.5 mt-4">
  <div class="bg-green-500 h-2.5 rounded-full" style="width: {currentStep / (steps.length - 1) * 100}%"></div>
</div>

<div class="mt-8">
  <slot name="step-0" />
  <slot name={`step-${currentStep}`} />
</div>

