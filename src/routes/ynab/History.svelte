<script>
    import * as d3 from 'd3'
    import { beforeUpdate } from 'svelte';
    import * as Plot from '@observablehq/plot';
    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format } from "./ynab";

    export let names;
    export let data;
    export let faceted;

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

    beforeUpdate(updateData);

</script>

{#if data.length > 0}
{#if faceted}
    <PlotContainer options={{
      x: { type: "band", tickFormat: d3.utcFormat("%b") },
      y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
      color: { legend: false, domain: selectedNames, range: selectedColors },
      axis: null,
      facet: { label: null },
      marks: [
          Plot.axisX(),
          Plot.barY(_data, {
              x: "month",
              y: "activity",
              fill: "name",
              tip: { format: { y: format, x: d3.utcFormat("%b"), fy: false, fill: false } },
              fy: "name",
          }),
          Plot.text(
            selectedNames,
            {
              text: d => d,
              fy: d => d,
              fill: d => d,
              frameAnchor: "top-left",
              dx: 6,
              dy: 6,
            },
          ),
          Plot.ruleY(
              averages,
              {
                y: "average",
                fy: "name",
                stroke: "name",
                tip: { format: { y: format, name: false, fy: false, stroke: false } }
              }
          ),
          Plot.frame({stroke: "lightgrey"}),
      ],
    }} />
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
          Plot.ruleY([overallAverage], { tip: { format: { y: format, fy: false } } })
      ],
    }} />
{/if}
{:else}
(No data to show)
{/if}
