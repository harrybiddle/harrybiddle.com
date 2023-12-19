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
    let data = [
        ...groupedSumBudgetedActivityScheduled(
            categories,
            ({month: d => d.month, group: c => c.group, name: c => c.group}),
            1,  // level
        ),
        ...groupedSumBudgetedActivityScheduled(
            categories,
            ({month: d => d.month, group: c => c.group, name: c => c.category}),
            2,  // level
        ),
    ]

</script>

<Picker choices={foo} {data} />
