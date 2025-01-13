
<script>
	import { color } from "d3";
    import SparkBarCatchup from "./SparkBarCatchUp.svelte";
    import SparkBarRemaining from "./SparkBarRemaining.svelte";

    import { format, formatZero } from "./ynab";

    import { colours } from "./constants";

    export let activity;
    export let budgeted;
    export let name;
    export let level;
    export let pLines = [];
    export let pNow = null;

    function colourRemaining(remaining) {
        if (remaining < 0) return colours.red;
        if (remaining < 5) return colours.grey;
        else return colours.green;
    }

    function colourExcess(remaining) {
        if (remaining < 0) return colours.red;
        if (remaining < 5) return colours.grey;
        else return colours.teal;
    }

    let lines = [];
    $: lines = pLines.map(p => p * budgeted);
</script>

<!-- Label (e.g. "Regular")-->
<span class="label level{level}">
    {name}
</span>

<!-- Budgeted amount (e.g. 1,200) -->
<span class="budgeted level{level}">
    {formatZero(budgeted)}
</span>

<!-- Sparkbar -->
<span class="sparkbar level{level}">
    {#if pNow === null}
        <SparkBarRemaining
            {activity}
            {budgeted}
            {lines}
        />
    {:else}
        <SparkBarCatchup
            {activity}
            {budgeted}
            {lines}
            expected={pNow * budgeted}
        />
    {/if}
</span>

<!-- Remaining -->
<span class="remaining level{level}" style="color: {colourRemaining(budgeted - activity)}">
    {format(budgeted - activity)}
</span>

<!-- Excess (e.g. -50) -->
{#if pNow === null}
    <span class="excess level{level}"></span>
{:else}
    {@const excess = budgeted * pNow - activity}
    <span class="excess level{level}" style="color: {colourExcess(excess)}">
        {formatZero(excess)}
    </span>
{/if}

<style>
    span {
        vertical-align: middle;
        padding: 3px 5px 3px 5px;
        border-bottom: var(--border-width) solid var(--table-border-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-transform: none;
    }
    .level1 {
        font-weight: bold;
        background: var(--pico-color-slate-50);
    }
    .level2 {
        font-weight: bold;
        background: var(--pico-color-slate-100);
        text-transform: uppercase;
    }
    .label {
        padding-left: 10px;
    }
    .budgeted {
        text-align: right;
        color: var(--pico-color-slate-250);
    }
    .excess {
        padding-right: 10px;
        text-align: right;
    }
    .remaining {
        padding-right: 10px;
        text-align: right;
    }
</style>