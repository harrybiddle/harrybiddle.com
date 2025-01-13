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
        height: 1.5em;
    }
    table {
        border-spacing: 0;
        border-collapse: collapse;
    }
    td {
        padding: 0;
        padding: 3px 0px;
        border: 0px;
        padding-right: 5px;
    }
    td:first-child {
        width: 100%;
    }
    td:nth-child(2) {
        text-align: right;
    }
    td:not(:first-child) {
        white-space: nowrap;
    }
</style>

<table>
    <!-- income -->
    <tr>
        <td>
            <div style="margin-left: auto; width: {p(income)}%; background-color: {colours.green}"></div>
        </td>
        <td style="color: {colours.green}">
            {format(income)}
        </td>
        <td style="color: {colours.green}">
            Income
        </td>
    </tr>

    <!-- scheduled -->
    <tr>
        <td>
            <div style="margin-left: auto; width: {p(scheduled)}%; background-color: lightgrey"></div>
        </td>
        <td style="color: grey">
            {format(scheduled)}
        </td>
        <td style="color: grey">
            Scheduled
        </td>
    </tr>
    <!--
    For demonstration, here is how we could underlay a "projected" amount
    <tr>
        <td>
            <div style="height: 0px; overflow: visible">
                <div style="margin-left: auto; width: {p(scheduled)}%; background-color: purple; z-index: -1; position: relative; top: -20px"></div>
            </div>
        </td>
    </tr> -->

    <!-- yearly flexible -->
    <tr>
        <td>
            <div style="margin-left: auto; margin-right: {p(scheduled)}%; width: {p(yearlyFlexible)}%; background-color: lightgrey"></div>
        </td>
        <td style="color: grey">
            {format(yearlyFlexible)}
        </td>
        <td style="color: grey">
            Yearly flexible
        </td>
    </tr>

    <!-- monthly flexible -->
    <tr>
        <td>
            <div style="margin-left: {p(Math.max(0, saving))}%; width: {p(monthlyFlexible)}%; background-color: lightgrey"></div>
        </td>
        <td style="color: grey">
            {format(monthlyFlexible)}
        </td>
        <td style="color: grey">
            Monthly flexible
        </td>
    </tr>

    <!-- savings/overspend -->
    <tr>
        <td>
            <div style="width: {p(Math.abs(saving))}%; background-color: {saving < 0 ? colours.red : colours.green};"></div>
        </td>
        <td style="color: {saving < 0 ? colours.red : colours.green}">
            {format(Math.abs(saving))}
        </td>
        <td style="color: {saving < 0 ? colours.red : colours.green}">
            {saving < 0 ? "Overspend " : "Saving "}
        </td>
    </tr>
</table>