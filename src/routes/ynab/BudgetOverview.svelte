<script>
    import { format } from "./ynab.js"
    import { colours } from "./constants.js"

    import * as d3 from 'd3';

    export let income;
    export let categoriesMonthlyFlexible;
    export let categoriesMonthlyScheduled;
    export let categoriesYearlyFlexible;
    export let categoriesYearlyScheduled;
    export let p1;  // TODO rename

    const calculateTotal = categories => d3.sum(categories, category => category.budget);

    function getStandardDeviation(p1) {
        // these numbers are based on an analysis done in the "patchwork" project,
        // named "projecting_monthly_spend.qmd"
        if (p1 <= 0.2) return 0.50;
        if (p1 > 0.2 && p1 <= 0.4) return 0.19;
        if (p1 > 0.4 && p1 <= 0.6) return 0.14;
        if (p1 > 0.6 && p1 <= 0.8) return 0.10;
        if (p1 > 0.8) return 0.07;
    }

    let scheduled = 0;
    let monthlyFlexible = 0;
    let yearlyFlexible = 0;
    let totalWidth = 0;
    let saving = 0;
    let savingColour = colours.green;
    let projectedMonthlyFlexibleExpenditure = null;
    let projectedSaving = null;
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
            projectedMonthlyFlexibleExpenditure = monthlyFlexibleExpenditureSoFar / p1;
            const errorMarginEuros = monthlyFlexible * getStandardDeviation(p1);
            projectedSaving = [
                // lower bound
                projectedMonthlyFlexibleExpenditure + errorMarginEuros,
                // expected
                projectedMonthlyFlexibleExpenditure,
                 // upper bound
                Math.max(0, projectedMonthlyFlexibleExpenditure - errorMarginEuros),
            ];
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
    const getMaxX = () => {
        const m = Math.max(monthlyFlexible, projectedMonthlyFlexibleExpenditure || monthlyFlexible);
        return 1.03 * Math.max(income, scheduled + yearlyFlexible + m);
    }
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
        viewBox={`0 0 ${getMaxX()} 50`}
        preserveAspectRatio="none"
        style="grid-area: svg; height: 100%; width: 100%"
    >
        {#if true}
        {@const xa = income}
        {@const xb = scheduled + yearlyFlexible + monthlyFlexible}
        {@const strokeWidth = getMaxX() / 200}

        <g transform={`scale(-1,1) translate(-${getMaxX()},0)`}>
            <!-- income -->
            <rect x=0 y=2 width={income} height=6 fill="{colours.green}" stroke={colours.green} stroke-width="0.5px"></rect>
            <line x1=0 x2=0 y1=8 y2=42 stroke={colours.grey} stroke-width="0.5px" stroke-dasharray="2 1" ></line>
            <line x1={income} x2={income} y1=8 y2=42 stroke={colours.grey} stroke-width={strokeWidth} stroke-dasharray="2 1" ></line>

            <!-- scheduled -->
            <rect x=0 y=12 width={scheduled} height=6 fill="{colours.grey}" stroke={colours.grey} stroke-width="0.5px"></rect>

            <!-- yearly flexible -->
            <rect x={scheduled} y=22 width={yearlyFlexible} height=6 fill="{colours.grey}" stroke={colours.grey} stroke-width="0.5px"></rect>

            <!-- monthly flexible -->
            {#if true}
                {@const width = monthlyFlexible}
                {@const x1 = scheduled + yearlyFlexible}
                {@const x2 = x1 + width}

                <rect x={x1} y=32 width={width} height=6 fill="{colours.grey}" stroke={colours.grey} stroke-width="0.5px"></rect>
                <line x1={x2} x2={x2} y1=38 y2=42 stroke={savingColour} stroke-width={strokeWidth} stroke-dasharray="2 1" ></line>
            {/if}

            <!-- savings -->
            {#if true}
                {@const x = Math.min(xa, xb)}
                <rect x={x} y=42 width={Math.abs(saving)} height=6 fill={savingColour} stroke={savingColour} stroke-width="0.5px"></rect>
            {/if}

            <!-- projected savings -->
            {#if projectedSaving !== null}
                {@const x = scheduled + yearlyFlexible + projectedSaving[1]}
                {@const x0 = scheduled + yearlyFlexible + projectedSaving[2]}
                {@const x1 = scheduled + yearlyFlexible + projectedSaving[0]}

                <!-- bounds -->
                <line
                    y1={42 + 3} y2={42 + 3}
                    x1={x0}
                    x2={x1}
                    stroke="#56C7D2" stroke-width="0.5" style="mix-blend-mode: color-burn;"
                ></line>
                <line
                    x1={x0} x2={x0} y1={42 + 3 - 1} y2={42 + 3 + 1}
                    stroke="#56C7D2" stroke-width={strokeWidth} style="mix-blend-mode: color-burn;"
                ></line>
                <line
                    x1={x1} x2={x1} y1={42 + 3 - 1} y2={42 + 3 + 1}
                    stroke="#56C7D2" stroke-width={strokeWidth} style="mix-blend-mode: color-burn;"
                ></line>

                <!-- expected -->
                <line
                    x1={x}
                    x2={x}
                    y1={42 + 3 - 2} y2={42 + 3 + 2}
                    stroke="#56C7D2" stroke-width={strokeWidth} style="mix-blend-mode: color-burn;"
                ></line>
            {/if}
        </g>
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