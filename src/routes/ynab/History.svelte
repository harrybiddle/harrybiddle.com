<!--
  @History

  Displays past activity as a bar chart.

  The data inputted should be an array of objects with the following properties:

   | Property              | Description |
   |-----------------------|-------------|
   | activity              | Positive number |
   | group, group_id       | Grouping of entries |
   | category, category_id | Sub-grouping of entries |
   | month                 | Javascript Date object representing the first day of the month |
   | note                  | (Optional) A string containing information about default averaging (%yearly%) |

-->
<script context="module">
    let counter = 0
</script>

<script>
    import * as d3 from 'd3'

    import Picker from "./Picker.svelte";
    import HistoryPlotAveraged from './HistoryPlotAveraged.svelte';
	import HistoryPlotByMonth from './HistoryPlotByMonth.svelte';
    import ProfitLossPlotByMonth from './ProfitLossPlotByMonth.svelte';
    import ProfitLossPlotAveraged from './ProfitLossPlotAveraged.svelte';

    import { format, noteIsYearly, groupedSumBudgetedActivityScheduled } from "./ynab";
	import { onMount } from 'svelte';

    export let categories;
    export let dual = false;

    counter += 1;

    function makeHierarchy(categories) {
        let hierarchy = categories.map((c) => ({
            group_id: "g" + c.group_id,
            group: c.group,
            category_id: "c" + c.category_id,
            category: c.category,
            note: c.note,
        }));
        hierarchy = [...new Set(hierarchy.map(JSON.stringify))].map(JSON.parse);
        return hierarchy;
    }

    // parsing of the budget data to a set of filtering/averaging choices
    function constructDefaultChoices(categories) {
        // we make an initial guess at which categories should be shown and averaged,
        const shouldAverage = (category) => noteIsYearly(category.note);
        const shouldShow = (category) => !["House Purchase", "Mortgage Amortisation", "Owings", "House"].includes(category.category);

        // construct choices
        const hierarchy = makeHierarchy(categories);
        const groups = d3.flatGroup(
            hierarchy,
            (c) => c.group_id,
            (c) => c.group,
        );
        return groups.map(([group_id, group, cs]) => ({
            id: group_id,
            label: group,
            show: true,
            expanded: false,
            children: cs.map((c) => ({
                id: c.category_id,
                label: c.category,
                show: shouldShow(c),
                average: shouldAverage(c),
            })),
        }));
    }

    function cartesianProduct(...a) {
        return a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
    }

    function getMonths(categories) {
        const dates = categories.map(c => c.month);
        const uniqueDates = new Set();
        const result = [];

        dates.forEach(date => {
            const time = date.getTime();
            if (!uniqueDates.has(time)) {
                uniqueDates.add(time);
                result.push(date);
            }
        });

        return result;
    }

    // applying the filtering and averaging logic to the budget data,
    // to produce the data for the chart
    function preprocessData(categories, choices, stacking) {
        // TODO: clean up this whole function, which is quite confusing
        // filter categories and groups to only those which are shown
        // in case the choices are out of sync with the data, we look
        // for the presence of "show: true"
        const categoryChoices = choices.flatMap((g) => g.children);
        const visibleCategoryIds = new Set(
            categoryChoices.filter((c) => c.show).map((c) => c.id),
        );
        const visibleGroupIds = new Set(choices.filter((g) => g.show).map((g) => g.id));
        let visibleCategories = categories
            .filter((c) => visibleGroupIds.has("g" + c.group_id))
            .filter((c) => visibleCategoryIds.has("c" + c.category_id));

        // replace values by averages when requested
        // TODO: clean up this code
        const months = getMonths(categories);
        const numberMonths = months.length;
        const categoryIdsToAverage = new Set(
            categoryChoices.filter((c) => c.average).map((c) => c.id),
        );
        const visibleCategoriesToAverage = visibleCategories.filter(
            (c) => categoryIdsToAverage.has("c" + c.category_id)
        );
        const averages = d3.flatRollup(
            visibleCategoriesToAverage,
            (cs) => d3.sum(cs, (c) => c.activity) / numberMonths,
            (c) => c.category_id,
            (c) => c.category,
            (c) => c.group_id,
            (c) => c.group,
        );
        const visibleAveragedCategories = cartesianProduct(months, averages).map(
            ([month, category_id, category, group_id, group, activity]) => ({
                month,
                category_id,
                category,
                group_id,
                group,
                activity,
            }),
        );
        const visibleNonAveragedCategories = visibleCategories.filter(
            (c) => !categoryIdsToAverage.has("c" + c.category_id),
        );
        visibleCategories = [...visibleNonAveragedCategories, ...visibleAveragedCategories];

        // calculate overall average
        const overallAverage = d3.sum(visibleCategories, (c) => c.activity) / numberMonths;

        // sum up data
        const groupsIdsToCollapse = new Set(
            choices.filter((g) => !g.expanded).map((g) => g.id),
        );
        let groupsToSum = visibleCategories.filter((c) =>
            groupsIdsToCollapse.has("g" + c.group_id),
        );
        let categoriesToSum = visibleCategories.filter(
            (c) => !groupsIdsToCollapse.has("g" + c.group_id),
        );

        const grouping = {
            group: c => c.group,
            group_id: c => c.group_id,
            ...(stacking === "averaged" ? {} : { month: (d) => d.month })
        };
        let data = [
            ...groupedSumBudgetedActivityScheduled(
                groupsToSum,
                { ...grouping, id: c => "g" + c.group_id, name: c => c.group },
                1, // level
            ),
            ...groupedSumBudgetedActivityScheduled(
                categoriesToSum,
                { ...grouping, id: c => "c" + c.category_id, name: c => c.category },
                2, // level
            ),
        ];

        if (stacking === "averaged")
            data = data.map(d => ({...d, activity: d.activity / numberMonths}));

        // Add a sort order, which is by the average activity
        const lookup = d3.rollup(
            data,
            ds => d3.sum(ds, d => d.activity) / numberMonths,
            d => d.id
        )
        data = data.map(d => ({...d, sortOrder: lookup.get(d.id)}));

        // Add overall average to the final data
        return Object.assign(data, { average: overallAverage });
    }

    let stacking = "monthly";
    let choices;

    onMount(() => {
        choices = constructDefaultChoices(categories);
    });
</script>

{#if choices && stacking}
    {@const data = preprocessData(categories, choices, stacking)}

    {#if stacking === "averaged"}
        {#if dual}
            <ProfitLossPlotAveraged {data} />
        {:else}
            <HistoryPlotAveraged {data} />
        {/if}
    {:else if stacking === "monthly"}
        {#if dual}
            <ProfitLossPlotByMonth {data} months={getMonths(categories)} />
        {:else}
            <HistoryPlotByMonth {data} months={getMonths(categories)} />
        {/if}
    {/if}

    <p style="text-align: center; margin-bottom: 0px">
        <small>Average: {format(data.average)}</small>
    </p>
{/if}

<article>
    <!-- Stacking options -->
    <fieldset>
      <label for={`monthly${counter}`}>
        <input bind:group={stacking} type="radio" id={`monthly${counter}`} name="stacking" value="monthly">
        Monthly
      </label>
      <label for={`averaged${counter}`}>
        <input bind:group={stacking} type="radio" id={`averaged${counter}`} name="stacking" value="averaged">
        Averaged
      </label>
    </fieldset>

    <!-- Selection/expansion and averaging of individual groups and categories -->
    {#if choices}
        <Picker bind:choices defaultChoices={constructDefaultChoices(categories)} />
    {/if}
</article>

<style>
    article {
        margin-top: 10px;
        padding: 20px;
    }

    label {
        display: inline;
        margin-right: 20px;
    }
</style>