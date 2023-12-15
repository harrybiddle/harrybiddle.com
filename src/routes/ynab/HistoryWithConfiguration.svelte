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
    import Picker from "./Picker.svelte";

    import { parseBudget, groupedSumBudgetedActivityScheduled } from "./ynab";
    export let budgets;

    const categories = budgets.reduce(
        (accumulator, budget) => [...accumulator, ...parseBudget(budget)],
        []
    ).filter(d => d.activity != 0);

    // get list of groups & categories for picker
    const foo = d3.rollup(
        categories,
        ds => [...new Set(ds.map(d => d.category))],  // TODO: sort
        d => d.group,
    );
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
    data = data.map(d => d.group === "One-Off" ? ({...d, activity: oneOffAverage}) : d);

    // sort data by the average value for nicely stacked chart
    data = data.sort((a, b) => averages.get(b.group) - averages.get(a.group));

    // use labels (TODO: can we do this in plot options?)
    const labelOverride = new Map([["One-Off", "One-Off (avg.)"]])
    data = data.map(d => ({...d, label: labelOverride.get(d.group) || d.group}));

    let selectedValue = true; // Initialize the selected value to true

    // do not display
    let facetedData = data.filter(d => d.group !== "One-Off");
    let facetedAverages = [...averages.entries()].filter(([group, average]) => group !== "One-Off").map(([group, average]) => ({group, average}))

</script>

<Picker
    choices={foo}
    {facetedData}
    {facetedAverages}
    {averages}
    {data}
/>
