
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

    function excessClass(remaining) {
        if (remaining < 0) return "negativeExcess";
        if (remaining < 5) return "zeroExcess";
        else return "positiveExcess";
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
    class="excess level{level} {excessClass(remaining)}"
>
    {formatZero(remaining)}
</span>

<!-- Remaining -->
<span class="remaining level{level} {excessClass(budgeted - activity)}">
    {format(budgeted - activity)}
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
    .positiveExcess {
        color: rgb(149, 224, 108);
    }
    .negativeExcess {
        color: rgb(218, 116, 34);
    }
    .zeroExcess {
        color: var(--pico-color-slate-250);
    }    
</style>