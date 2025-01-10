<!--
  @component

  A stacked bar chart of historical spend, with months on the x-axis.

  Inputs:

    data: an array of objects with the following properties:
        activity (the total spend), name (display name), month (a `Date` object),
        sortOrder (anything that is sortable, such as an integer).
-->

<script>
    import * as d3 from 'd3'
    import * as Plot from '@observablehq/plot';

    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format, parseMonthstamp } from "./ynab";

    export let data;
    export let monthstamps;

    const monthstampToDate = monthstamp => parseMonthstamp(monthstamp).date;

    let dates = [];
    let dataWithDates = [];
    let monthlyTotals = [];
    $: {
        dates = monthstamps.sort(d3.ascending).map(monthstampToDate);

         // An array of objects like { activity: 100.50, monthstamp: 24300 }
        monthlyTotals = d3.flatRollup(
            data,
            _categories => d3.sum(_categories, d => d.activity),
            d => d.monthstamp
        ).map(([monthstamp, activity]) =>
            ({activity, monthstamp, date: monthstampToDate(monthstamp)})
        );

        // add date objects to the data
        dataWithDates = data.map(d => ({...d, date: monthstampToDate(d.monthstamp)}));
    }

    const formatDate = d3.utcFormat("%b");

</script>

{#if monthstamps.length > 0}
    <PlotContainer
        options={{
            x: { type: "band", tickFormat: formatDate, domain: dates },
            y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
            style: { fontSize: "15.75px", fontFamily: "PT Sans,sans-serif", overflow: true, background: "transparent", },
            marginBottom: 50,
            color: { legend: true, className: "foobar" },
            marks: [
                Plot.axisX(),
                Plot.barY(
                    dataWithDates.sort((a, b) => b.sortOrder - a.sortOrder),
                    {
                        x: "date",
                        y: "activity",
                        fill: "name",
                        tip: { format: {y: format, x: formatDate, fy: false, fill: true} },
                    },
                ),
                Plot.text(
                    monthlyTotals,
                    {
                        x: "date",
                        y: "activity",
                        text: d => format(d.activity),
                        lineAnchor: "middle",
                        textAnchor: "middle",
                        dy: -12
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