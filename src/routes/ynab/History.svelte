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
    import { Sankey } from "./d3_sankey"

    console.log(Sankey)

    import { parseBudget, groupedSumBudgetedActivityScheduled, format } from "./ynab";
    export let budgets;

    const categories = budgets.reduce(
        (accumulator, budget) => [...accumulator, ...parseBudget(budget)],
        []
    )
    let data = groupedSumBudgetedActivityScheduled(
			categories,
			({month: d => d.month, group: c => c.group, name: c => c.group}),
			1
		).sort((a, b) => {

		if (a.activity < b.activity) return 1;
		if (a.activity > b.activity) return -1;

		return 0; // Objects are considered equal
	});

    // replace "One-Off" with average
    const averages = d3.rollup(
        data,
        data => d3.mean(data, d => d.activity),
        d => d.group
    )
    const oneOffAverage = averages.get("One-Off")
    const overallAverage = d3.sum(averages.values())
    data = data.map(d => d.group === "One-Off" ? ({...d, activity: oneOffAverage}) : d);

    // sort data by the average value for nicely stacked chart
    data = data.sort((a, b) => averages.get(b.group) - averages.get(a.group));

    // use labels (TODO: can we do this in plot options?)
    const labelOverride = new Map([["One-Off", "One-Off (avg.)"]])
    data = data.map(d => ({...d, label: labelOverride.get(d.group) || d.group}));

    let faceted = false;

    let selectedValue = true; // Initialize the selected value to true

    // do not display
    let facetedData = data.filter(d => d.group !== "One-Off");
    let facetedAverages = [...averages.entries()].filter(([group, average]) => group !== "One-Off").map(([group, average]) => ({group, average}))
    //
    // console.log(
    //   [
	// 	...groupedSumBudgetedActivityScheduled(
	// 		categories,
	// 		({group: c => 'Total', name: c => 'Total'}),
	// 		2
	// 	),
	// 	...groupedSumBudgetedActivityScheduled(
	// 		categories,
	// 		({group: c => c.group, name: c => c.group}),
	// 		1
	// 	),
	// 	...groupedSumBudgetedActivityScheduled(
	// 		categories,
	// 		({group: c => c.group, name: c => c.category}),
	// 		0
	// 	)
	// ]
    // )

  function handleSelection(value) {
    selectedValue = value;
  }

  console.log(d3.sankey)

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
      Plot.barY(faceted ? facetedData : data, {
          x: "month",
          y: "activity",
          fill: "group",
          tip: { format: { y: format, x: d3.utcFormat("%b"), fy: false, fill: !faceted } },
          ...(faceted ? {fy: "group"} : {})
      }),
      ...(faceted ? [
          Plot.text(
            [...new Set(facetedData.map(d => d.group))],
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
          Plot.frame({stroke: "lightgrey"})
      ] : [
          Plot.ruleY([overallAverage], { tip: { format: { y: format, fy: false } } })
      ]),
  ],
}} />
