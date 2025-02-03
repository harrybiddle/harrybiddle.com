
<script>
    export let label0;
    export let label1;
    export let label2 = null;
    export let label3 = null;
    let active = 0;
</script>

<style>
    .tabs {
        /* display the tabs side-by-side with a small gap */
        display: flex;
        gap: 10px;
    }
    .tabs > button {
        /* make it a bit more rounded */
        border-radius: calc(3 * var(--border-radius));

        /* fit snugly to article below */
        margin-bottom: 0px;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;

        /* add a border to tie the tab with the article */
        border: 1px solid var(--pico-color-grey-150);

        /* blend into the card below */
        background: var(--card-background-color);
        border-bottom: none;

    }
    article {
        /* fit snugly to tabs above */
        margin-top: 0px;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;

        /* disable shadow, since it's hard to get them around the tabs */
        box-shadow: none;

        /* instead add a box to tie the tab with the article */
        border: 1px solid var(--pico-color-grey-150);
    }
    .selected {
        /* remove border below tab */
        box-shadow: 0px 3px 0px -1px #fff;
    }
    .unselected {
        /* make text grey so it appears inactive */
        color: var(--secondary);
    }
</style>

<div class="tabs">
    <button
        class={`outline contrast ${active === 0 ? "selected" : "unselected"}`}
        on:click={() => active = 0}
    >
        {label0}
    </button>
    <button
        class={`outline contrast ${active === 1 ? "selected" : "unselected"}`}
        on:click={() => active = 1}
    >
        {label1}
    </button>
    {#if label2 !== null}
        <button
            class={`outline contrast ${active === 2 ? "selected" : "unselected"}`}
            on:click={() => active = 2}
        >
            {label2}
        </button>
    {/if}
    {#if label3 !== null}
        <button
            class={`outline contrast ${active === 3 ? "selected" : "unselected"}`}
            on:click={() => active = 3}
        >
            {label3}
        </button>
    {/if}
</div>

<article style="padding-top: var(--block-spacing-horizontal)">
    {#if active === 0}
        <slot name="tab0"></slot>
    {:else if active === 1}
        <slot name="tab1"></slot>
    {:else if active === 2}
        <slot name="tab2"></slot>
    {:else if active === 3}
        <slot name="tab3"></slot>
    {/if}
</article>