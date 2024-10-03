<script>
    /* To-do:
     *   - Add text for "last updated" (latest transaction)
     *   - Collapse/expand category group on click
     *   - Clearer styling (background color?) to distinguish category groups
     *   - Consider striped rows for visual clarity
     *   - Maybe swap columns 2 and 4
     *   - Column headers?
     */
    import BudgetRow from "./BudgetRow.svelte";
    import Accordion from "./Accordion.svelte";

    import * as d3 from 'd3';

    import { parseBudget, noteIsMonthly, noteIsYearly, noteIsExclude, format, groupedSumBudgetedActivityScheduled } from "./ynab";

    export let budget;
    export let month;
    export let today;
    export let offset;

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

    const parsed = parseBudget(budget)
        .filter(e => !noteIsExclude(e.note))
        .map(
            e => {
                if (noteIsYearly(e.note)) {
                    // for yearly amounts, make it scheduled and cap spending at a constant
                    // budgeted amount
                    e.scheduled = e.budgeted;
                    e.activity = e.budgeted;
                }
                else if (noteIsMonthly(e.note)) {
                    // if the item is spent on a monthly basis, remove it from the daily
                    // count by setting the scheduled amount to be what was budgeted. However
                    // allow the activity to exceed this if we did overspend
                    e.scheduled = e.budgeted;
                    e.activity = Math.max(e.activity, e.budgeted);
                }

                // British spelling for 'Uncategorized'
                if (e.category === "Uncategorized") {
                    e.group = "Uncategorised"
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

    function sumup(categories) {
        return ({
            budgeted: d3.sum(categories, e => e.budgeted),
            activity: d3.sum(categories, e => e.activity),
            scheduled: d3.sum(categories, e => e.scheduled), 
        });
    }    
    
    function addLines(c) {
        const pToEuros = p => mapRange(p, 0, 1, c.scheduled, c.budgeted)
        const current = pToEuros(currentZeroToOne)
        return ({
            lines: linesZeroToOne.map(pToEuros),
            current: current,
            remaining: current - c.activity,            
        })
    }

    const total = sumup(parsed);
    const totalLines = addLines(total);

    const nonzero = parsed.filter(d => (d.activity || d.budgeted || d.scheduled));
    const final = d3.flatRollup(
        nonzero,
        categories => {
            const groupTotal = sumup(categories);

            const children = groupedSumBudgetedActivityScheduled(
			    categories,
			    ({
                    month: d => d.month, 
                    group: c => c.group, 
                    group_id: c => c.group_id, 
                    id: c => c.category_id, 
                    name: c => c.category,
                }),
			    0 /* level */
		    );

            return ({...groupTotal, children: children})
        },
        d => d.group_id,
        d => d.group,
    ).map(([group_id, group, row]) => ({...row, name: group, level: 1, show: group === "Regular"}))
    .sort((a, b) => b.budgeted - a.budgeted);
</script>

<style>
    .grid {
        display: grid;
        grid-template-columns: 
            130px                   /* Label:    fixed width     */
            80px                    /* Budgeted: fixed width     */
            1fr                     /* Sparkbar: remaining space */
            80px                    /* Excess:   fixed width     */
        ;
        font-size: 0.7954545455em;  /* 17.5 px                   */
        gap: 0px;
    }
</style>

<p>
    Estimated spend at end of month: {format(projectedSpend)}
</p>

<!-- Total -->
<div class="grid">    
    <BudgetRow 
        activity={total.activity}
        budgeted={total.budgeted}
        current={totalLines.current}
        level=2
        lines={totalLines.lines}
        name="Total"
        remaining={totalLines.remaining}
        scheduled={total.scheduled}
    />    
</div>

<!-- Category Groups -->
{#each final as c}
    {@const m = addLines(c)}

    <Accordion open={c.show}>
        <div class="grid" slot="head">
            <BudgetRow 
                activity={c.activity}
                budgeted={c.budgeted}
                current={m.current}
                level={c.level}
                lines={m.lines}
                name={c.name}
                remaining={m.remaining}
                scheduled={total.scheduled}
            />    
        </div>

        <!-- Categories -->
         <div slot="body">
            {#each c.children as child}
                {@const mchild = addLines(child)}

                <div class="grid">    
                    <BudgetRow 
                        activity={child.activity}
                        budgeted={child.budgeted}
                        current={mchild.current}
                        level={child.level}
                        lines={mchild.lines}
                        name={child.name}
                        remaining={mchild.remaining}
                        scheduled={child.scheduled}
                    />    
                </div>
            {/each}
        </div>
    </Accordion>
{/each}