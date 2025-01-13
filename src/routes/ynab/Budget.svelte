<script>
    import { parseMonthstamp, constructMonthstamp } from "./ynab"
    import BudgetMonthlyFlexible from "./BudgetMonthlyFlexible.svelte";
    import BudgetOverview from "./BudgetOverview.svelte";
    import Tabs from "./Tabs.svelte";

    import * as d3 from 'd3';

    export let categories;  // all data, array
    export let monthstamp;  // current monthstamp, int
    export let day;         // current day of month, int

    let categoriesMonthlyFlexible = [];
    let categoriesMonthlyScheduled = [];
    let categoriesYearlyScheduled = [];
    let categoriesYearlyFlexible = [];

    const pLinesYear = Array.from({ length: 11 }, (_, i) => (i + 1) / 12);
    let pNowMonth = 0, pNowYear = 0;
    let pLinesMonth = [];
    $: {
        // ------------------------------------------------------------------------- //
        // sort the data into four different buckets
        // ------------------------------------------------------------------------- //
        const today = new Date();
        const firstMonthstampOfYear = constructMonthstamp(today.getFullYear(), 0);
        categories.forEach(category => {
            if (category.from_savings) {
                // skip
            }
            else if (category.is_yearly) {
                if ((firstMonthstampOfYear <= category.monthstamp) && (category.monthstamp <= monthstamp)) {
                    if (category.is_scheduled) {
                        categoriesYearlyScheduled.push(category);
                    } else {
                        categoriesYearlyFlexible.push(category)
                    }
                }
            }
            else {
                // monthly - keep this month only
                if (category.monthstamp === monthstamp) {
                    if (category.is_scheduled) {
                        categoriesMonthlyScheduled.push(category);
                    }
                    else {
                        categoriesMonthlyFlexible.push(category);
                    }
                }
            }
        });

        // ------------------------------------------------------------------------- //
        // hack yearly amounts to be the right total!
        // TODO: how to handle this more elegantly?
        // ------------------------------------------------------------------------- //
        function hack(categories) {
            return d3.flatRollup(
                categories,
                _categories => ({
                    ..._categories[0],
                    activity: d3.sum(_categories, c => c.activity),
                    budgeted: 12 * d3.sum(_categories, c => c.budgeted) / _categories.length,
                }),
                category => category.category_id,
            ).map(([_, c]) => c)
        }
        categoriesYearlyScheduled = hack(categoriesYearlyScheduled);
        categoriesYearlyFlexible = hack(categoriesYearlyFlexible);

        // ------------------------------------------------------------------------- //
        // calculate progress through month
        // ------------------------------------------------------------------------- //
        const { month } = parseMonthstamp(monthstamp);
        const monthLengths = [
            31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
        ]
        const daysInMonth = monthLengths[month];
        pNowMonth = day / daysInMonth;

        pLinesMonth = [];  // TODO: fill lines with position of saturdays

        // ------------------------------------------------------------------------- //
        // calculate progress through year
        // ------------------------------------------------------------------------- //
        pNowYear = (month + 1 + pNowMonth) / 12;
    }

</script>

<!-- Budget Overview -->
<BudgetOverview
    {categoriesMonthlyFlexible}
    {categoriesMonthlyScheduled}
    {categoriesYearlyFlexible}
    {categoriesYearlyScheduled}
/>


<h3>Flexible budget</h3>
<Tabs label0="Monthly" label1="Yearly">
    <!-- Monthly Flexible Budget -->
    <div slot="tab0">
        <BudgetMonthlyFlexible categories={categoriesMonthlyFlexible} pNow={pNowMonth} pLines={pLinesMonth} />
    </div>
     <!-- TODO: Yearly Flexible Budget -->
    <div slot="tab1">
        <BudgetMonthlyFlexible categories={categoriesYearlyFlexible} pNow={pNowYear} pLines={pLinesYear} />
    </div>
</Tabs>

<h3>Scheduled</h3>
<Tabs label0="Monthly" label1="Yearly">
    <!-- TODO: Monthly Scheduled Budget -->
    <div slot="tab0">
        <BudgetMonthlyFlexible categories={categoriesMonthlyScheduled} pNow={pNowMonth} pLines={pLinesMonth} />
    </div>
    <!-- Monthly Flexible Budget -->
    <div slot="tab1">
        <BudgetMonthlyFlexible categories={categoriesYearlyScheduled} pNow={pNowYear} pLines={pLinesYear} />
    </div>
</Tabs>
