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
        height: 2em;
        margin: 5px 0px 5px 0px;
        overflow: visible;
        white-space: nowrap;

        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding-right: 5px;
    }
</style>

<div style="display: flex; flex-direction: column;">
    <!-- income -->
    <div style="display: flex; flex-direction: column; align-items: flex-end">
        <div class="bar" style="width: {p(income)}%; background-color: {colours.teal}; color: white;">
            Income {format(income)}
        </div>
    </div>

    <!-- scheduled -->
    <div style="display: flex; flex-direction: column; align-items: flex-end">
        <div class="bar" style="width: {p(scheduled)}%; background-color: {colours.grey}; color: grey">Scheduled {format(scheduled)}</div>
    </div>

    <!-- yearly flexible -->
    <div style="display: flex; flex-direction: column; align-items: flex-end">
        <div class="bar" style="width: {p(yearlyFlexible)}%; margin-right: {p(scheduled)}%; background-color: {colours.grey}; color: grey">
            Yearly flexible {format(yearlyFlexible)}
        </div>
    </div>

    <!-- monthly flexible -->
    <div style="display: flex; flex-direction: column; align-items: flex-end">
        <div class="bar" style="width: {p(monthlyFlexible)}%; margin-right: {p(scheduled + yearlyFlexible)}%; background-color: {colours.grey}; color: grey">
            Monthly flexible {format(monthlyFlexible)}
        </div>
    </div>

    <!-- savings/overspend -->
    <div style="display: flex; flex-direction: column;">
        <div class="bar" style="width: {p(Math.abs(saving))}%; background-color: {saving < 0 ? colours.red : colours.green};"></div>
        <div style="white-space: nowrap; color: {saving < 0 ? colours.red : colours.green}">{saving < 0 ? "Overspend " : "Saving "}{format(saving)}</div>
    </div>
</div>