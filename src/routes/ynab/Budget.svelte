<script>
    /* To-do:
     *   - Add text for "last updated" (latest transaction)
     *   - Collapse/expand category group on click
     *   - Clearer styling (background color?) to distinguish category groups
     *   - Consider striped rows for visual clarity
     *   - Maybe swap columns 2 and 4
     *   - Column headers?
     */
    import SparkBarCatchup from "./SparkBarCatchUp.svelte";
    import * as d3 from 'd3';
    import { parseBudget, sumBudgets } from "./ynab";

    export let budget;
    export let month;
    export let today;
    export let offset;

    const colours = ({
        blue: "#429EA6",
        green: "#95E06C",
        darkGreen: "#0B5D1E",
        red: "#DA7422",
        grey: "lightgrey"
    });

    function mapRange(value, fromMin, fromMax, toMin, toMax) {
        // Calculate the normalized value within the input range
        const normalizedValue = (value - fromMin) / (fromMax - fromMin);

        // Map the normalized value to the output range
        return toMin + normalizedValue * (toMax - toMin);
    }

    // --------------------------------------------------------------------------------
    // date operations
    // --------------------------------------------------------------------------------
    const target = month;
    const currentDay = today;
    let datesInMonth;
    {
        const start = target.startOf("month");
        datesInMonth = Array.from(Array(start.daysInMonth()).keys()).map((x) =>
            start.add(x, "days")
        );
    }
    const saturdays = datesInMonth.filter((d) => d.day() == 6);
    const numberDaysInMonth = datesInMonth.length;
    const linesZeroToOne = saturdays.map((d) => d.date() / numberDaysInMonth);
    const currentZeroToOne = offset == 0 ? currentDay / numberDaysInMonth : 1
    // --------------------------------------------------------------------------------

    const format = x => d3.format(",.2r")(Math.round(x / 10) * 10)
    const formatZero = x => (Math.abs(x) < 5 ? "-" : format(x))

    const parsed = parseBudget(budget)
        .map(
            e => {
                // ignore the activity of "One-Off": set the activity to be the budget
                // also consider the entire budget to be scheduled spending
                if (e.group === "One-Off") {
                  e.scheduled = e.budgeted;
                  e.activity = e.budgeted;
                }

                // we also set the activity of the "Scheduled" category to group be what
                // was budgeted, except if it exceeds the budget. We consider the entire
                // budget to be scheduled spending
                if (e.group === "Scheduled") {
                  e.scheduled = e.budgeted;
                  e.activity = Math.max(e.activity, e.budgeted);
                }

                return e;
            }
        )

    const projectedSpend = d3.sum(
        parsed,
        item => {
            if (item.scheduled !== 0) {
                return Math.max(item.scheduled, item.activity);
            }
            else {
                return item.activity / currentZeroToOne;
            }
        }
    )

    const summary = sumBudgets(parsed);

    const final = summary.map(c => {
        const pToEuros = p => mapRange(p, 0, 1, c.scheduled, c.budgeted)
        const lines = linesZeroToOne.map(pToEuros);
        const current = pToEuros(currentZeroToOne);
        const remaining = current - c.activity;

        return ({...c, lines, current, remaining})
    })

    function shouldDisplayRow(row) {
        // hide all level 0's except "regular"
        if ((row.level === 0) && (row.group !== "Regular")) return false

        // only show if the row has an activity, a schedule, or a budget
        return (row.activity || row.budgeted || row.scheduled);
    }
</script>

<style>
    table {
        border-collapse: collapse;
    }
    td, th {
        padding: 3px;
    }
    tr td:first-child {
        /* category name */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 120px;
        text-transform: none;
    }
    tr td:nth-child(2) {
        /* budgeted */
        text-align: right;
        vertical-align: middle;
        color: lightgray;
    }
    tr td:nth-child(3) {
        /* sparkbar */
        vertical-align: middle;
    }
    tr td:nth-child(4) {
        /* remaining */
        text-align: right;
        vertical-align: middle;
    }
</style>

<p>
    Estimated spend at end of month: {format(projectedSpend)}
</p>

<table class="sparkbars">
    {#each final as c}
        {#if shouldDisplayRow(c) }
            {@const fontWeight = c.level > 0 ? "bold" : "normal"}
            <tr style="
                border-bottom: 1px solid {c.level > 1 ? 'black' : 'transparent'};
                text-transform: {c.level > 1 ? 'uppercase' : 'none'};
                background: {c.level > 1 ? 'WhiteSmoke' : 'transparent'};
            ">
                <td style="font-weight: {fontWeight}">{c.name}</td>
                <td style="font-weight: {fontWeight}">{formatZero(c.budgeted)}</td>
                <td style="vertical-align: middle">
                    <SparkBarCatchup
                        activity={c.activity}
                        budgeted={c.budgeted}
                        scheduled={c.scheduled}
                        lines={c.lines}
                        current={c.current}
                    />
                </td>
                <td style="font-weight: {fontWeight}; color: {c.remaining < 0 ? colours.red : (c.remaining < 5 ? colours.grey : colours.green)};">{formatZero(c.remaining)}</td>
            </tr>
        {/if}
    {/each}
</table>
