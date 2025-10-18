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

    const sort = data => data.sort((a, b) => b.sortOrder - a.sortOrder);
</script>

{#if data.length > 0}
    <PlotContainer
        options={{
            x: { type: "band", tickFormat: formatDate, domain: dates },
            y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
            style: { fontSize: "15.75px", fontFamily: "PT Sans,sans-serif", overflow: true, background: "transparent", },
            marginBottom: 50,
            color: { legend: true, className: "foobar" },
            marks: [
                Plot.axisX(),
                // breakdown into categories
                Plot.barY(
                    dataWithDates.sort((a, b) => b.sortOrder - a.sortOrder),
                    {
                        x: "date",
                        y: "activity",
                        fill: "name",
                        insetRight: 20,
                        fillOpacity: 0.5
                    },
                ),
                // profit/loss
                Plot.barY(
                    monthlyTotals,
                    {
                        x: "date",
                        y: "activity",
                        tip: { format: {y: format, x: formatDate, fy: false, fill: true} },
                        insetLeft: 15,
                        insetRight: 15,
                        fill: "#333C4E",
                    },
                ),
                Plot.text(
                    monthlyTotals.filter(d => d.activity >= 0),
                    {
                        x: "date",
                        y: "activity",
                        text: d => format(d.activity),
                        lineAnchor: "middle",
                        textAnchor: "middle",
                        dy: -12,
                    },
                ),
                Plot.text(
                    monthlyTotals.filter(d => d.activity < 0),
                    {
                        x: "date",
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