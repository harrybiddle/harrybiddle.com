<script>
    /* TODO:
     *  - Add average
     *  - Transpose is nooot working at all - another way to do this?
     *  - Average out One-Off category group over whole range
     *  - Consistent sorting
     *  - Tooltips on rollover
     */
    import * as d3 from 'd3'
    import * as Plot from '@observablehq/plot';
    import PlotContainer from "../../lib/PlotContainer.svelte";

    import { parseBudget, groupedSumBudgetedActivityScheduled, humanMonth } from "./ynab";
    export let budgets;

    const categories = budgets.reduce(
        (accumulator, budget) => [...accumulator, ...parseBudget(budget)],
        []
    )
    const data = groupedSumBudgetedActivityScheduled(
			categories,
			c => c.group,
			c => c.group,
			1
		).sort((a, b) => {

		if (a.activity < b.activity) return 1;
		if (a.activity > b.activity) return -1;

		return 0; // Objects are considered equal
	});

    console.log(data)
</script>

<PlotContainer options={{
  x: { type: "band", tickFormat: d3.utcFormat("%b") },
  color: { legend: true },
  marks: [
      Plot.barY(data, {x: "month", y: "activity", fill: "group", tip: true}),
  ],
}} />

<style>
  /* Add CSS styles for your chart here */
</style>
