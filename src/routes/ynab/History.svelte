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
    import { beforeUpdate } from 'svelte';

    import { format } from "./ynab";

    export let facetedData;
    export let facetedAverages;
    export let data;
    export let averages;
    export let groupStates;

    let faceted = false;

    let _facetedAverages;
    let _data;
    let _facetedData;
    let _overallAverage;

    function updateData() {
        const checkedGroups = new Set(
            groupStates.filter(d => d.checked).map(d => d.group)
        );
        const filter = d => checkedGroups.has(d.group)
        _facetedData = facetedData.filter(filter);
        _facetedAverages = facetedAverages.filter(filter);
        _data = data.filter(filter);
        _overallAverage = d3.sum(
            [...averages.entries()]
                .filter(([group, value]) => checkedGroups.has(group))
                .map(([group, value]) => value)
        )
    }

	beforeUpdate(updateData);

</script>

<fieldset>
  <label for="switch">
    Stack Bars
    <input type="checkbox" id="switch" name="switch" role="switch" bind:checked={faceted}>
    Stack Charts
  </label>
</fieldset>

<PlotContainer options={{
  x: { type: "band", tickFormat: d3.utcFormat("%b") },
  y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
  color: { legend: !faceted },
  ...(faceted ? {axis: null} : {}),
  facet: faceted ? { label: null } : {},
  marks: [
      Plot.axisX(),
      Plot.barY(faceted ? _facetedData : _data, {
          x: "month",
          y: "activity",
          fill: "group",
          tip: { format: { y: format, x: d3.utcFormat("%b"), fy: false, fill: !faceted } },
          ...(faceted ? {fy: "group"} : {})
      }),
      ...(faceted ? [
          Plot.text(
            [...new Set(_facetedData.map(d => d.group))],
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
              _facetedAverages,
              {
                y: "average",
                fy: "group",
                stroke: "group",
                tip: { format: { y: format, group: false, fy: false, stroke: false } }
              }
          ),
          Plot.frame({stroke: "lightgrey"})
      ] : [
          Plot.ruleY([_overallAverage], { tip: { format: { y: format, fy: false } } })
      ]),
  ],
}} />
