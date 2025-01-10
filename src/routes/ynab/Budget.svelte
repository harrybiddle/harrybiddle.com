<!--
    @SparkBarCatchup

    Expects an array of objects like:

        {
            "monthstamp": 24300,
            "is_income": false,
            "is_scheduled": false,
            "is_yearly": false,
            "with_now": false,
            "group_id": "d98ee767-55cd-4ebf-aef8-4c04ec828914",
            "group": "Car",
            "category": "Petrol",
            "category_id": "25a313d2-8c32-42eb-b7ea-cfb6ed5310ba",
            "activity": 0,
            "budgeted": 0
        }
-->
<script>
    /* To-do:
     *   - Add text for "last updated" (latest transaction)
     *   - Collapse/expand category on click
     *   - Maybe swap columns 2 and 4
     */
    import BudgetRow from "./BudgetRow.svelte";
    import Accordion from "./Accordion.svelte";

    import * as d3 from 'd3';

    export let categories;
    export let pNow;
    export let pLines;

    let groups  = [];

    $: {
        // group the categories into groups and add in the group total
        // we also sort the groups and categories so the biggest are at the top
        const nonzeroCategories = categories.filter(d => (d.activity || d.budgeted));
        const budgetedAscending = (a, b) => b.budgeted - a.budgeted;
        groups = d3.flatRollup(
            nonzeroCategories,
            _categories => ({
                budgeted: d3.sum(_categories, e => e.budgeted),
                activity: d3.sum(_categories, e => e.activity),
                children: _categories.sort(budgetedAscending),
                group_id: _categories[0].group_id,
                group: _categories[0].group,
                show: _categories[0].group === "Regular",
            }),
            // group by keys
            d => d.group_id,
            d => d.group,
        )
        .map(([group_id, group, row]) => row)
        .sort(budgetedAscending);
    }
</script>

<style>
    #grid-container {
        overflow-x: auto;          /* Enable horizontal scrolling */
        max-width: 100%;           /* Ensure it doesn't extend beyond the viewport */
        --overflow-column-width: 100px
    }

    .grid {
        display: grid;
        grid-template-columns:
            120px                         /* Label:    fixed width           */
            50px                          /* Budgeted: fixed width           */
            calc(100% - 120px - 50px - 60px - var(--overflow-column-width))  /* Sparkbar: remaining space */
            60px                          /* Remaining: fixed width          */
            var(--overflow-column-width)  /* Excess:    fixed with, overflow */
        ;
        font-size: 0.7954545455em;  /* 17.5 px                   */
        gap: 0px;

        /* Set width to over 100% to force overflow */
        width: calc(100% + var(--overflow-column-width));
    }
</style>

<div id="grid-container">

    <!-- Category Groups -->
    {#each groups as group}
        <Accordion open={group.show}>
            <div class="grid" slot="head">
                <BudgetRow
                    activity={group.activity}
                    budgeted={group.budgeted}
                    name={group.group}
                    level=1
                    {pLines}
                />
            </div>

            <!-- Categories -->
            <div slot="body">
                {#each group.children as category}
                    <div class="grid">
                        <BudgetRow
                            activity={category.activity}
                            budgeted={category.budgeted}
                            name={category.category}
                            level=0
                            {pLines}
                            pNow={category.with_now ? pNow : null}
                        />
                    </div>
                {/each}
            </div>
        </Accordion>
    {/each}
</div>