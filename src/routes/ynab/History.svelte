<script>
    import * as d3 from 'd3'
    import { beforeUpdate } from 'svelte';
    import * as Plot from '@observablehq/plot';
    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format } from "./ynab";

    export let names;
    export let data;
    export let averaged;

    let selectedNames;
    let selectedColors;
    let averages;
    let overallAverage;
    let _data;

    function updateData() {
        // make a color palette
        const colorGetter = d3.scaleOrdinal().domain(names).range(d3.schemeTableau10);
        selectedNames = [...new Set(data.map(d => d.name))];
        selectedColors = selectedNames.map(colorGetter);

        // calculate averages
        const nameToAverage = d3.rollup(
            data,
            data => d3.mean(data, d => d.activity),
            d => d.name
        )
        averages = [...nameToAverage.entries()].map(([name, average]) => ({name, average}));
        overallAverage = d3.sum(nameToAverage.values())

        // sort data by the average value for nicely stacked chart
        // TODO: can this be done in Plot options instead?
        _data = data.sort((a, b) => nameToAverage.get(b.name) - nameToAverage.get(a.name));

        // replace "One-Off" with average
        const oneOffAverage = nameToAverage.get("One-Off")
        if (oneOffAverage !== undefined) {
            _data = data.map(d => d.group === "One-Off" ? ({...d, activity: oneOffAverage}) : d);
        }
    }

    function sumActivityPerMonth(_data) {
        /* this function takes input like this, with multiple entries for each month:
         *
         *    [{"month": "2023-09-01T00:00:00.000Z", "activity": 2126.93, ...}, ...
         *
         * then groups by month and sums activity, returning the same array but with
         * one entry per month
         */
        return d3.flatRollup(
            _data,
            ds => d3.sum(ds, d => d.activity),
            d => d.month,
        ).map(([month, activity]) => ({month, activity}))
    }

    function computeMeanGroupedByName(_data) {
        // _data looks like this:
        // [{month: "2023-09-01T00:00:00.000Z", group: "Regular", name: "Regular", budgeted: 1341, activity: 2126.93, scheduled: 0, level: 1}, ...]

        const numberOfMonths = new Set(_data.map(d => d.month.getUTCFullYear() + d.month.getUTCMonth() / 12 )).size

        // group the data by name and take the mean
        // object looks like [["Regular", 15036], ... ]
        const arrayOfTuples = d3.flatRollup(
            _data,
            keys => d3.sum(keys, d => d.activity) / numberOfMonths,
            d => d.name
        );

        // convert to array of objects, to produce
        // [{name: "Regular", activity: 15036}, ... ]
        return arrayOfTuples.map(
            ([name, averageActivity]) => ({name, averageActivity})
        )
    }

    beforeUpdate(updateData);

</script>

{#if data.length > 0}
{#if averaged}
    {@const averagedData = computeMeanGroupedByName(_data)}
    <PlotContainer options={{
      marginLeft: 100,
      marginRight: 50, // to leave enough space for text mark
      y: { label: null },  // hide y-axis label
      x: { label: "average monthly spend" },
      color: { legend: false, domain: selectedNames, range: selectedColors },
      marks: [
          Plot.barX(
              averagedData,
              {
                  x: "averageActivity",
                  y: "name",
                  fill: "name",
                  tip: { format: { x: format, fill: false } },
                  sort: { y : "x" },
              },
         ),
         Plot.text(
             averagedData,
             {
                 x: "averageActivity",
                 y: "name",
                 text: d => format(d.averageActivity),
                 lineAnchor: "middle",
                 textAnchor: "start",
                 dx: 5
             },
         ),
      ],
    }} />
    <!-- the style here is chosen to match the Observable plot widget above -->
    <p style="text-align: center; font-size: 0.6rem; font-family: 'PT Sans'">
        Total average spend: €{format(d3.sum(averagedData, d => d.averageActivity))}
    </p>
{:else}
    <PlotContainer options={{
      x: { type: "band", tickFormat: d3.utcFormat("%b") },
      y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
      color: { legend: true, domain: selectedNames, range: selectedColors },
      marks: [
          Plot.axisX(),
          Plot.barY(_data, {
              x: "month",
              y: "activity",
              fill: "name",
              tip: { format: { y: format, x: d3.utcFormat("%b"), fy: false, fill: true } },
          }),
          Plot.text(
              sumActivityPerMonth(_data), {
                  x: "month",
                  y: "activity",
                  text: d => format(d.activity),
                  dy: -10,
          }),
      ],
    }} />
{/if}
{:else}
(No data to show)
{/if}
