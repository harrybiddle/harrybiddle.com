<script>
    /* TODO:
     *  - Filters to show/remove some groups
     *  - Optionally show categories, not just groups
     *  - Toggle to facet mode (with same colours and average per line)
     *  - Gridlines
     */
    import * as d3 from 'd3'
    import * as Plot from '@observablehq/plot';
    import PlotContainer from "../../lib/PlotContainer.svelte";

    import { parseBudget, groupedSumBudgetedActivityScheduled, format } from "./ynab";
    export let budgets;

    const categories = budgets.reduce(
        (accumulator, budget) => [...accumulator, ...parseBudget(budget)],
        []
    )
    let data = groupedSumBudgetedActivityScheduled(
			categories,
			c => c.group,
			c => c.group,
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

    const faceted = true;

</script>

<input

<PlotContainer options={{
  x: { type: "band", tickFormat: d3.utcFormat("%b") },
  y: { grid: true, ticks: 5 },
  color: { legend: !faceted },
  marks: [
      Plot.barY(data, {
          x: "month",
          y: "activity",
          fill: "group",
          tip: { format: { y: format, x: false } },
          ...(faceted ? ({fy: "group"}) : ({})),
      }),
      ...(faceted ? [] : [Plot.ruleY([overallAverage], { tip: { format: { y: format } } })]),
  ],
}} />
