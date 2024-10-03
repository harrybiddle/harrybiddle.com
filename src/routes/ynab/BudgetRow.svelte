
<script>
    import SparkBarCatchup from "./SparkBarCatchUp.svelte";

    import { format, formatZero } from "./ynab";

    export let activity;
    export let budgeted;
    export let current;
    export let level;
    export let lines;
    export let name;
    export let remaining;
    export let scheduled;

    const colours = ({
        blue: "#429EA6",
        green: "#95E06C",
        darkGreen: "#0B5D1E",
        red: "#DA7422",
        grey: "lightgrey"
    });

    function remainingClass(remaining) {
        if (remaining < 0) return "remainingNegative";
        if (remaining < 5) return "remainingZero";
        else return "remainingPositive";
    }
</script>

<!-- Label (e.g. "Regular")-->
<span class="label level{level}">
    {name}{name === "One-Off" ? "*" : ""}
</span>

<!-- Budgeted amount (e.g. 1,200) -->
<span class="budgeted level{level}">
    {formatZero(budgeted)}
</span>

<!-- Sparkbar -->
<span class="sparkbar level{level}">
    <SparkBarCatchup
        activity={activity}
        budgeted={budgeted}
        scheduled={scheduled}
        lines={lines}
        current={current}
    />
</span>

<!-- Excess (e.g. -50) -->
<span 
    class="excess level{level} {remainingClass(remaining)}"
>
    {formatZero(remaining)}
</span>

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
    .budgeted {
        text-align: right;
        color: var(--pico-color-slate-250);
    }
    .excess {
        text-align: right;
    }    
    .remainingPositive {
        color: rgb(149, 224, 108);
    }
    .remainingNegative {
        color: rgb(218, 116, 34);
    }
    .remainingZero {
        color: var(--pico-color-slate-250);
    }    
</style>