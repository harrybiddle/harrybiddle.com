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

    let scheduled = 0, monthlyFlexible = 0, yearlyFlexible = 0, totalWidth = 0, saving = 0, savingColour = colours.green;
    $: {
        scheduled = calculateTotal(categoriesYearlyScheduled) / 12 + calculateTotal(categoriesMonthlyScheduled);
        monthlyFlexible = calculateTotal(categoriesMonthlyFlexible);
        yearlyFlexible = calculateTotal(categoriesYearlyFlexible) / 12;

        const expenditure = scheduled + monthlyFlexible + yearlyFlexible;
        totalWidth = Math.max(income, expenditure);

        saving = income - expenditure;
        savingColour = saving < 0 ? colours.red : colours.green;
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
        height: 1.5em;
        border: 1px solid lightgrey;
        padding: 1px;
    }
    #container {
        display: grid;
        grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
        grid-template-areas:
            ".                income           income          income    income-amount           income-label"
            ".                .                .               scheduled scheduled-amount        scheduled-label"
            ".                .                yearly-flexible .         yearly-flexible-amount  yearly-flexible-label"
            "monthly-flexible monthly-flexible .               .         monthly-flexible-amount monthly-flexible-label"
            "savings          .                .               .         savings-amount          savings-label"
    }
</style>

<div
    id="container"
    style="grid-template-columns: {Math.abs(saving)}fr {monthlyFlexible - Math.abs(saving)}fr {yearlyFlexible}fr {scheduled}fr auto  auto;"
>
    <!-- Income -->
    <div style="grid-area: income; background-color: {colours.green}"></div>
    <div style="grid-area: income-amount; color: {colours.green}">{format(income)}</div>
    <div style="grid-area: income-label; color: {colours.green}">Income</div>
    <div style="grid-area: l"></div>

    <!-- Scheduled -->
    <div style="grid-area: scheduled; background-color: {colours.grey}"></div>
    <div style="grid-area: scheduled-amount; color: {colours.grey}">{format(scheduled)}</div>
    <div style="grid-area: scheduled-label; color: {colours.grey}">Scheduled</div>

    <!-- Yearly flexible -->
    <div style="grid-area: yearly-flexible; background-color: {colours.grey}"></div>
    <div style="grid-area: yearly-flexible-amount; color: {colours.grey}">{format(yearlyFlexible)}</div>
    <div style="grid-area: yearly-flexible-label; color: {colours.grey}">Yearly Flexible</div>

    <!-- Monthly flexible -->
    <div style="grid-area: monthly-flexible; background-color: {colours.grey}"></div>
    <div style="grid-area: monthly-flexible-amount; color: {colours.grey}">{format(monthlyFlexible)}</div>
    <div style="grid-area: monthly-flexible-label; color: {colours.grey}">Monthly Flexible</div>

    <!-- Savings -->
    <div style="grid-area: savings; background-color: {savingColour}"></div>
    <div style="grid-area: savings-amount; color: {savingColour}">{format(Math.abs(saving))}</div>
    <div style="grid-area: savings-label; color: {savingColour}">{saving < 0 ? "Overspend" : "Savings"}</div>
</div>
