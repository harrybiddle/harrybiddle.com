<script>
    /* TODO:
     *  - Filters to show/remove some groups
     *  - Optionally show categories, not just groups
     *  - Bigger font size
     *  - Split into two sub-components for faceted / non-faceted
     *  - Add +- 2 std deviations to averages
     *  - Add text mark for averages, not just popover? And labels for bars?
     *  - Consistent legend colours between faceted / non-faceted
     */
    import * as d3 from 'd3'
    import * as Plot from '@observablehq/plot';
    import PlotContainer from "../../lib/PlotContainer.svelte";

    import { format } from "./ynab";

    export let groups;
    export let facetedAverages;
    export let data;
    export let overallAverage;
    export let faceted;

    const groupColorGetter = d3.scaleOrdinal().domain(groups).range(d3.schemeTableau10);
    const selectedGroups = [...new Set(data.map(d => d.group))];
    const selectedColors = selectedGroups.map(groupColorGetter);

</script>

{#if faceted}
    <PlotContainer options={{
      x: { type: "band", tickFormat: d3.utcFormat("%b") },
      y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
      color: { legend: false, domain: selectedGroups, range: selectedColors },
      axis: null,
      facet: { label: null },
      marks: [
          Plot.axisX(),
          Plot.barY(data, {
              x: "month",
              y: "activity",
              fill: "group",
              tip: { format: { y: format, x: d3.utcFormat("%b"), fy: false, fill: false } },
              fy: "group",
          }),
          Plot.text(
            [...new Set(data.map(d => d.group))],
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
              facetedAverages,
              {
                y: "average",
                fy: "group",
                stroke: "group",
                tip: { format: { y: format, group: false, fy: false, stroke: false } }
              }
          ),
          Plot.frame({stroke: "lightgrey"}),
      ],
    }} />
{:else}
    <PlotContainer options={{
      x: { type: "band", tickFormat: d3.utcFormat("%b") },
      y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
      color: { legend: true, domain: selectedGroups, range: selectedColors },
      marks: [
          Plot.axisX(),
          Plot.barY(data, {
              x: "month",
              y: "activity",
              fill: "group",
              tip: { format: { y: format, x: d3.utcFormat("%b"), fy: false, fill: true } },
          }),
          Plot.ruleY([overallAverage], { tip: { format: { y: format, fy: false } } })
      ],
    }} />
{/if}
