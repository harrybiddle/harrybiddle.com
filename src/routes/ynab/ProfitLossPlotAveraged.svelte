<script>
    import * as d3 from 'd3'
    import * as Plot from '@observablehq/plot';

    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format } from "./ynab";

    export let data;
    export let months;

    function sumOverNames(data) {
        return d3.flatRollup(
            data,
            ds => d3.sum(ds, d => d.activity),
            d => d.name
        ).map(([name, activity]) => ({activity, name}))
    }

    function process(data) {
       const positive = sumOverNames(data.filter(d => d.activity >= 0));
       const negative = sumOverNames(data.filter(d => d.activity < 0));
       return [
           ({activity: 0, x: "Net"}),  // just for x-axis
           ...positive.map(d => ({name: d.name, activity: d.activity, x: "Positive"})),
           ...negative.map(d => ({name: d.name, activity: -d.activity, x: "Negative"})),
       ]
    }
</script>

{#if data.length > 0}
    <PlotContainer
        options={{
            y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
            style: { fontSize: "15.75px", fontFamily: "PT Sans,sans-serif", overflow: true, background: "transparent", },
            marginBottom: 50,
            color: { legend: true, className: "foobar" },
            marks: [
                Plot.axisX(),
                Plot.barY(
                    process(data),
                    {
                        x: "x",
                        y: "activity",
                        fill: "name",
                        tip: { format: {y: format, x: false, fy: false, fill: true} },
                    },
                ),
                Plot.barY(
                    [{x: "Net", activity: d3.sum(data, d => d.activity)}],
                    {
                        x: "x",
                        y: "activity",
                        fill: "#333C4E",
                        tip: { format: {y: format, x: false, fy: false, fill: true} },
                    },
                ),
            ],
        }}
    />
{:else}
    (No data to show)
{/if}

<style>
    /* don't know why this doesn't work.... */
    :global(.foobar) {
        font-size: "15.75px";
        font-family: "PT Sans,sans-serif";
    }
</style>