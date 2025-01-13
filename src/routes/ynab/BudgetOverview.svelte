<script>
    import { format } from "./ynab.js"
    import { colours } from "./constants.js"

    import * as d3 from 'd3';

    export let categoriesMonthlyFlexible;
    export let categoriesMonthlyScheduled;
    export let categoriesYearlyFlexible;
    export let categoriesYearlyScheduled;

    const calculateTotal = categories => d3.sum(categories, category => category.budgeted);
    const income = 6600;

    let scheduled = 0, monthlyFlexible = 0, yearlyFlexible = 0, totalWidth = 0, saving = 0
    $: {
        scheduled = calculateTotal(categoriesYearlyScheduled) / 12 + calculateTotal(categoriesMonthlyScheduled);
        monthlyFlexible = calculateTotal(categoriesMonthlyFlexible);
        yearlyFlexible = calculateTotal(categoriesYearlyFlexible) / 12;

        const expenditure = scheduled + monthlyFlexible + yearlyFlexible;
        totalWidth = Math.max(income, expenditure);

        saving = income - expenditure;
    }

    /*

    Positive savings

         a (=0)               100
     0   ┌───────────────────────┐
         │                       │ income
    10   └───────────────────────┘
                           b   100
    15                     ┌─────┐
                           │     │ scheduled
    25            c        └─────┘
    30            ┌────────┐
                  │        │ yearly flexible
    40       d    └────────┘
    45       ┌───┐
             │   │ monthly flexible
    55   0   └───┘
    60   ┌──┐
         │  │ savings
    70   └──┘

    Negative savings

            a                 100
            ┌───────────────────┐
            │                   │  income
            └───────────────────┘
            ┆             b   100
            ┆             ┌─────┐
            ┆             │     │ scheduled
            ┆       c     └─────┘
            ┆       ┌─────┐
            ┆       │     │ yearly flexible
        d (=0)      └─────┘
        ┌──────────┐
        │          │ monthly flexible
        └──────────┘
        0   ┆
        ┌───┐
        │   │ savings
        └───┘
     */

    const p = p => 100 * p / totalWidth;
</script>

<style>
    div {
        font-size: large;
    }
    .bar {
        height: 20px;
        margin: 5px 0px 5px 0px;
    }
</style>

<div style="display: flex; flex-direction: column;">
    <!-- income -->
    <div style="display: flex; align-items: center; justify-content: flex-end">
        <div class="bar" style="width: {p(income)}%; background-color: {colours.teal};"></div>
        <div style="position: absolute; left: {100 + 2}%; white-space: nowrap; color: {colours.teal}">{format(income)} Income</div>
    </div>

    <!-- scheduled -->
    <div style="display: flex; align-items: center; justify-content: flex-end">
        <div class="bar" style="width: {p(scheduled)}%; background-color: {colours.grey};"></div>
        <div style="position: absolute; left: {100 + 2}%; white-space: nowrap; color: grey">{format(scheduled)} Income</div>
    </div>

    <!-- yearly flexible -->
    <div style="display: flex; align-items: center; justify-content: flex-end">
        <div class="bar" style="width: {p(yearlyFlexible)}%; margin-right: {p(scheduled)}%; background-color: {colours.grey};"></div>
        <div style="position: absolute; left: {100 - p(scheduled) + 2}%; white-space: nowrap; color: grey">{format(yearlyFlexible)} Yearly flexible</div>
    </div>

    <!-- monthly flexible -->
    <div style="display: flex; align-items: center; justify-content: flex-end">
        <div class="bar" style="width: {p(monthlyFlexible)}%; margin-right: {p(scheduled + yearlyFlexible)}%; background-color: {colours.grey};"></div>
        <div style="position: absolute; left: {100 - p(scheduled + yearlyFlexible) + 2}%; white-space: nowrap; color: grey">{format(monthlyFlexible)} Monthly flexible</div>
    </div>

    <!-- savings/overspend -->
    <div style="display: flex; align-items: center;">
        <div class="bar" style="width: {p(Math.abs(saving))}%; background-color: {saving < 0 ? colours.red : colours.green};"></div>
        <div style="position: absolute; left: {p(Math.abs(saving)) + 2}%; white-space: nowrap; color: {saving < 0 ? colours.red : colours.green}">{format(saving)}{saving < 0 ? " Overspend" : " Saving"}</div>
    </div>
</div>