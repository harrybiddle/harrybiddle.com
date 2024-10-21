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
    export let dual = false;

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
    const left = data => sort(dual ? data.filter(d => d.leftmost_bar) : data);
    const right = data => sort(dual ? data.filter(d => !d.leftmost_bar) : []);

    console.log(data);

</script>

{#if data.length > 0}
    <PlotContainer
        options={{
            // x: { type: "band", tickFormat: d3.utcFormat("%b"), domain: months.sort(d3.ascending) },
            y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
            style: { fontSize: "15.75px", fontFamily: "PT Sans,sans-serif", overflow: true, background: "transparent", },
            marginBottom: 50,
            color: { legend: true, className: "foobar" },
            marks: [
                Plot.axisX(),
                // leftmost bar
                Plot.barY(
                    // left(data), 
                    sort(data),
                    {
                        // fx: "month",
                        x: "leftmost_bar",
                        y: "activity",
                        fill: "name",                 
                        tip: { format: {y: format, x: d3.utcFormat("%b"), fy: false, fill: true} },
                        // ...(
                        //     dual ? ({
                        //         insetLeft: 15,
                        //         insetRight: 15,
                        //         dx: -15,
                        //     }) : ({})
                        // )
                    },
                ),
                // // rightmost bar
                // Plot.barY(
                //     right(data), 
                //     {
                //         x: "month",
                //         y: "activity",
                //         fill: "name",                 
                //         tip: { format: {y: format, x: d3.utcFormat("%b"), fy: false, fill: true} },
                //         ...(
                //             dual ? ({
                //                 insetLeft: 15,
                //                 insetRight: 15,
                //                 dx: 15,
                //             }) : ({})
                //         )                        
                //     },
                // ),
                ...(
                    dual ? [] : [
                        Plot.text(
                        sumOverMonths(data),
                        {
                            x: "month",
                            y: "activity",
                            text: d => format(d.activity),
                            lineAnchor: "middle",
                            textAnchor: "middle",
                            dy: -12
                        },
                        ),
                    ]
                )
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