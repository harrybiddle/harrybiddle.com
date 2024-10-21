<script>
    import * as d3 from 'd3'    
    import * as Plot from '@observablehq/plot';

    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format } from "./ynab";

    export let data;
    export let months;

    function sumOverMonths(data) {
        /*
            Returns an array like the following:

                [
                    { activity: 100.50, month: "2024-08-01T00:00:00.000Z" }, 
                    ...
                ]
        */
        return d3.flatRollup(
            data,
            ds => d3.sum(ds, d => d.activity),
            d => d.month
        ).map(([month, activity]) => ({activity, month}))
    }

    const sort = data => data.sort((a, b) => b.sortOrder - a.sortOrder);
</script>

{#if data.length > 0}
    {@const totals = sumOverMonths(data)}
    <PlotContainer
        options={{
            x: { type: "band", tickFormat: d3.utcFormat("%b"), domain: months.sort(d3.ascending) },
            y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
            style: { fontSize: "15.75px", fontFamily: "PT Sans,sans-serif", overflow: true, background: "transparent", },
            marginBottom: 50,
            color: { legend: true, className: "foobar" },
            marks: [
                Plot.axisX(),
                // breakdown into categories
                Plot.barY(
                    sort(data),
                    {
                        x: "month",
                        y: "activity",
                        fill: "name",
                        insetRight: 20,
                        fillOpacity: 0.5                        
                    },
                ),
                // profit/loss
                Plot.barY(
                    totals, 
                    {
                        x: "month",
                        y: "activity",
                        tip: { format: {y: format, x: d3.utcFormat("%b"), fy: false, fill: true} },
                        insetLeft: 5,
                        insetRight: 5,
                        fill: "#333C4E",
                    },
                ),
                Plot.text(
                    totals.filter(d => d.activity >= 0),
                    {
                        x: "month",
                        y: "activity",
                        text: d => format(d.activity),
                        lineAnchor: "middle",
                        textAnchor: "middle",
                        dy: -12,
                    },
                ),
                Plot.text(
                    totals.filter(d => d.activity < 0),
                    {
                        x: "month",
                        y: "activity",
                        text: d => format(d.activity),
                        lineAnchor: "middle",
                        textAnchor: "middle",
                        dy: 12,
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