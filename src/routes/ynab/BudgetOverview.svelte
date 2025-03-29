<script>
    import { format } from "./ynab.js"
    import { colours } from "./constants.js"

    import * as d3 from 'd3';

    export let categoriesMonthlyFlexible;
    export let categoriesMonthlyScheduled;
    export let categoriesYearlyFlexible;
    export let categoriesYearlyScheduled;
    export let p1;  // TODO rename

    const calculateTotal = categories => d3.sum(categories, category => category.budget);
    const income = 7000;

    function getStandardDeviation(p1) {
        // these numbers are based on an analysis done in the "patchwork" project,
        // named "projecting_monthly_spend.qmd"
        if (p1 <= 0.2) return 0.50;
        if (p1 > 0.2 && p1 <= 0.4) return 0.19;
        if (p1 > 0.4 && p1 <= 0.6) return 0.14;
        if (p1 > 0.6 && p1 <= 0.8) return 0.10;
        if (p1 > 0.8) return 0.07;
    }

    let scheduled = 0, monthlyFlexible = 0, yearlyFlexible = 0, totalWidth = 0, saving = 0, savingColour = colours.green, projectedSaving = null;
    $: {
        scheduled = calculateTotal(categoriesYearlyScheduled) / 12 + calculateTotal(categoriesMonthlyScheduled);
        monthlyFlexible = calculateTotal(categoriesMonthlyFlexible);
        yearlyFlexible = calculateTotal(categoriesYearlyFlexible) / 12;

        const expenditure = scheduled + monthlyFlexible + yearlyFlexible;
        totalWidth = Math.max(income, expenditure);

        saving = income - expenditure;
        savingColour = saving < 0 ? colours.red : colours.green;

        if (p1 !== null) {
            const monthlyFlexibleExpenditureSoFar =  d3.sum(categoriesMonthlyFlexible, category => category.activity);
            const projectedMonthlyFlexibleExpenditure = monthlyFlexibleExpenditureSoFar / p1;
            const adjustSaving = newMonthlyFlexible =>  saving + monthlyFlexible - newMonthlyFlexible;
            const standardDeviation = getStandardDeviation(p1);
            projectedSaving = [
                // lower bound
                adjustSaving(projectedMonthlyFlexibleExpenditure * (1 + standardDeviation)),
                // expected
                adjustSaving(projectedMonthlyFlexibleExpenditure),
                 // upper bound
                adjustSaving(projectedMonthlyFlexibleExpenditure * (1 - standardDeviation)),
            ]
        }
    }

    /*

    Positive savings

        a (=0)               100
       ┌───────────────────────┐
       │                       │ income
       └───────────────────────┘
       ┆                 b   100
       ┆                 ┌─────┐
       ┆                 │     │ scheduled
       ┆        c        └─────┘
       ┆        ┌────────┐
       ┆        │        │ yearly flexible
       ┆   d    └────────┘
       ┆   ┌───┐
       ┆   │   │ monthly flexible
       0   └───┘
       ┌──┐
       │  │ savings
       └──┘


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
        font-size: 0.9em;
        color: grey;
    }
    #container {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        grid-template-rows: repeat(5, 1fr);
        grid-column-gap: 5px;
        grid-template-areas:
            "svg .  income-amount           income-label"
            "svg m1 scheduled-amount        scheduled-label"
            "svg m2 yearly-flexible-amount  yearly-flexible-label"
            "svg m3 monthly-flexible-amount monthly-flexible-label"
            "svg eq savings-amount          savings-label";
        margin-bottom: 40px;
    }
    #container > div {
        padding-top: 5px;
        padding-bottom: 5px;
    }
    .amount {
        text-align: right
    }

</style>

<div id="container">
    <svg
        viewBox="-1 0 102 50"
        preserveAspectRatio="none"
        style="grid-area: svg; height: 100%; width: 100%"
    >
        <!-- income -->
        {#if true}
            {@const x = 100 - p(income) }
            {@const w = p(income) }

            <rect x={x} y=2 width={w} height=6 fill="{colours.green}" stroke={colours.green} stroke-width="0.5px"></rect>
            <line x1={x}     x2={x}     y1=8 y2=42 stroke={colours.grey} stroke-width="0.5px" stroke-dasharray="2 1" ></line>
            <line x1={x + w} x2={x + w} y1=8 y2=12 stroke={colours.grey} stroke-width="0.5px" stroke-dasharray="2 1" ></line>
        {/if}

        <!-- scheduled -->
        {#if true}
            {@const x = 100 - p(scheduled)}
            <rect x={x} y=12 width={p(scheduled)} height=6 fill="{colours.grey}" stroke={colours.grey} stroke-width="0.5px"></rect>
            <line x1={x} x2={x} y1=18 y2=22 stroke={colours.grey} stroke-width="0.5px" stroke-dasharray="2 1" ></line>
        {/if}

        <!-- yearly flexible -->
        {#if true}
            {@const x = 100 - p(scheduled + yearlyFlexible)}
            <rect x={x} y=22 width={p(yearlyFlexible)} height=6 fill="{colours.grey}" stroke={colours.grey} stroke-width="0.5px"></rect>
            <line x1={x} x2={x} y1=28 y2=32 stroke={colours.grey} stroke-width="0.5px" stroke-dasharray="2 1" ></line>
        {/if}

        <!-- monthly flexible -->
        {#if true}
        {@const x = 100 - p(scheduled + yearlyFlexible + monthlyFlexible)}
            <rect x={x} y=32 width={p(monthlyFlexible)} height=6 fill="{colours.grey}" stroke={colours.grey} stroke-width="0.5px"></rect>
            <line x1={x} x2={x} y1=38 y2=42 stroke={colours.grey} stroke-width="0.5px" stroke-dasharray="2 1" ></line>
        {/if}

        <!-- savings -->
        <rect x=0 y=42 width={p(Math.abs(saving))} height=6 fill={savingColour} stroke={savingColour} stroke-width="0.5px"></rect>

        <!-- projected savings -->
        {#if projectedSaving !== null}
            <!-- bounds -->
            <rect
                x={p(Math.abs(saving - projectedSaving[0]))}
                y={42 + 0.5} width={p(projectedSaving[2] - projectedSaving[0])}
                height={6 - 1}
                fill-opacity="0"
                stroke="#56C7D2" stroke-width="0.4px" style="mix-blend-mode: color-burn;"
            ></rect>

            <!-- expected -->
            <line
                x1={p(Math.abs(saving - projectedSaving[1]))} x2={p(Math.abs(saving - projectedSaving[1]))}
                y1={42 + 0.5} y2={42 + 6 - 0.5}
                stroke="#56C7D2" stroke-width="0.4px" style="mix-blend-mode: color-burn;"
            ></line>
        {/if}
    </svg>

    <!-- income -->
    <div style="grid-area: income-amount; color: {colours.green}" class="amount">
        {format(income)}
    </div>
    <div style="grid-area: income-label; color: {colours.green}">
        Income
    </div>

    <!-- scheduled -->
    <div style="grid-area: m1">-</div>
    <div style="grid-area: scheduled-amount" class="amount">
        {format(scheduled)}
    </div>
    <div style="grid-area: scheduled-label">
        Scheduled
    </div>

    <!-- yearly flexible -->
    <div style="grid-area: m2">-</div>
    <div style="grid-area: yearly-flexible-amount" class="amount">
        {format(yearlyFlexible)}
    </div>
    <div style="grid-area: yearly-flexible-label">
        Yearly flexible
    </div>

    <!-- monthly flexible -->
    <div style="grid-area: m3">-</div>
    <div style="grid-area: monthly-flexible-amount" class="amount">
        {format(monthlyFlexible)}
    </div>
    <div style="grid-area: monthly-flexible-label">
        Monthly flexible
    </div>

    <!-- savings -->
    <div style="grid-area: eq">=</div>
    <div style="grid-area: savings-amount; color: {savingColour}" class="amount">
        {format(Math.abs(saving))}
    </div>
    <div style="grid-area: savings-label; color: {savingColour}">
        {saving < 0 ? "Overspend" : "Savings"}
    </div>
</div>