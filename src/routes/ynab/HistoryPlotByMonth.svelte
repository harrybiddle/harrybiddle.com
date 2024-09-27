<!--
  @component

  A stacked bar chart of historical spend, with months on the x-axis.

  Inputs:

    data: an array of objects with the following properties:
        activity (the total spend), name (display name), month (a `Date` object),
        sortOrder (anything that is sortable, such as an integer).

    months: an array of `Date` objects. This is used to draw the x-axis, which 
        important if we don't have a data point for every month.
-->

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

</script>

{#if data.length > 0}
    <PlotContainer
        options={{
            x: { type: "band", tickFormat: d3.utcFormat("%b"), domain: months.sort(d3.ascending) },
            y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
            color: { legend: true },
            marks: [
                Plot.axisX(),
                Plot.barY(
                    data.sort((a, b) => b.sortOrder - a.sortOrder), 
                    {
                        x: "month",
                        y: "activity",
                        fill: "name",                        
                        tip: { format: {y: format, x: d3.utcFormat("%b"), fy: false, fill: true} },
                        
                    },
                ),
                Plot.text(
                    sumOverMonths(data),
                    {
                        x: "month",
                        y: "activity",
                        text: d => format(d.activity),
                        lineAnchor: "middle",
                        textAnchor: "middle",
                        dy: -7
                    },
                ),
            ],
        }}
    />
{:else}
    (No data to show)
{/if}
