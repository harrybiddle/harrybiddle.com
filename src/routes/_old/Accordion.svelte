<script>
    export let open = false;
    import { slide } from 'svelte/transition';
    const toggle = () => open = !open
</script>
  

<div on:click={toggle} style="cursor: pointer">
    <slot name="head" ></slot>	      
</div>

{#if open}
    <div transition:slide>
        <slot name="body">
        </slot>
    </div>
{/if}

  