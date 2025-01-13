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
        console.log(totalWidth);

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
    const y = i => i / 70 * 50;

    const fontSizePx = 5;
    const marginRight = 0.3;  // i.e. 30%
    const k = 1 - marginRight;

    const viewboxX = 200;
    const textPadding = viewboxX * 0.01;

</script>

<svg viewbox="0 0 {viewboxX} 70" width="100%">
    <!-- income -->
    <rect
        x="{k * (100 - p(income))}%"
        y="0"
        height="{y(10)}"
        width="{k * p(income)}%"
        fill="{colours.teal}"
    ></rect>
    <text
        x="{viewboxX * k + textPadding}"
        y=0
        dy="{fontSizePx}px"
        font-size="{fontSizePx}px"
        color="{colours.teal}"
    >{format(income)} Income</text>

    <!-- scheduled -->
    <rect
        x="{k * (100 - p(scheduled))}%"
        y="{y(15)}"
        height="{y(10)}"
        width="{k * p(scheduled)}%"
        fill="{colours.grey}"
    ></rect>
    <text
        x="{viewboxX * k + textPadding}"
        y="{y(15)}"
        dy="{fontSizePx}px"
        font-size="{fontSizePx}px"
        color="grey"
    >{format(scheduled)} Scheduled</text>

    <!-- yearly flexible -->
    <rect
        x="{k * (100 - p(scheduled) - p(yearlyFlexible))}%"
        y="{y(30)}"
        height="{y(10)}"
        width="{k * p(yearlyFlexible)}%"
        fill="{colours.grey}"
    ></rect>
    <text
        x="{k * (100 - p(scheduled)) + textPadding}%"
        y="{y(30)}"
        dy="{fontSizePx}px"
        font-size="{fontSizePx}px"
        color="grey"
    >{format(yearlyFlexible)} Yearly flexible</text>

    <!-- monthly flexible -->
    <rect
        x="{k * (100 - p(scheduled) - p(yearlyFlexible) - p(monthlyFlexible))}%"
        y="{y(45)}"
        height="{y(10)}"
        width="{k * p(monthlyFlexible)}%"
        fill="{colours.grey}"
    ></rect>
    <text
        x="{k * (100 - p(scheduled) - p(yearlyFlexible)) + textPadding}%"
        y="{y(45)}"
        dy="{fontSizePx}px"
        font-size="{fontSizePx}px"
        color="grey"
    >{format(monthlyFlexible)} Monthly flexible</text>

    <!-- savings -->
    <rect
        x="0"
        y="{y(60)}"
        height={y(10)}
        width="{k * p(Math.abs(saving))}%"
        fill="{saving < 0 ? colours.red : colours.green}"
    ></rect>
    <text
        x="{k * p(Math.abs(saving)) + textPadding}%"
        y="{y(60)}"
        dy="{fontSizePx}px"
        font-size="{fontSizePx}px"
        color="{saving < 0 ? colours.red : colours.green}"
    >{format(Math.abs(saving))}{saving < 0 ? " Overspend": " Saving"}</text>
</svg>