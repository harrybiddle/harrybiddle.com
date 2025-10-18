<script>
    import { parseMonthstamp, validateAndFilterObjects } from "./ynab"
    import BudgetMonthlyFlexible from "./BudgetMonthlyFlexible.svelte";
    import BudgetOverview from "./BudgetOverview.svelte";
    import Tabs from "./Tabs.svelte";

    /*
        An array of objects with the following properties:

        | with_now
        | scheduled
        | budget
        | activity
        | category_id
        | category
        | group_id
        | group

        The first array should represent monthly budgeted amounts,
        and the second yearly.
    */
    export let income = 0;
    export let categoriesMonthly = [];
    export let categoriesYearly = [];
    export let monthstamp;  // current monthstamp, int
    export let day;         // current day of month, int

    const pLinesYear = Array.from({ length: 11 }, (_, i) => (i + 1) / 12);
    let pNowMonth = 0, pNowYear = 0;
    let pLinesMonth = [];
    $: {
        // check inputs
        const validate = data =>
            validateAndFilterObjects(
                data,
                [
                    "activity",
                    "budget",
                    "category_id",
                    "category",
                    "group_id",
                    "group",
                    "is_scheduled",
                    "with_now",
                ]
            );
        categoriesMonthly = validate(categoriesMonthly);
        categoriesYearly = validate(categoriesYearly);

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

    const isScheduled = c => c.is_scheduled;
    const isFlexible = c => !c.is_scheduled;
</script>

<!-- Budget Overview -->
<BudgetOverview
    income={income}
    categoriesMonthlyFlexible={categoriesMonthly.filter(isFlexible)}
    categoriesMonthlyScheduled={categoriesMonthly.filter(isScheduled)}
    categoriesYearlyFlexible={categoriesYearly.filter(isFlexible)}
    categoriesYearlyScheduled={categoriesYearly.filter(isScheduled)}
    p1={pNowMonth}
/>


<Tabs label0="Monthly flexible" label1="Yearly flexible" label2="Scheduled">
    <!-- Monthly Flexible -->
    <div slot="tab0">
        <BudgetMonthlyFlexible
            categories={categoriesMonthly.filter(isFlexible)}
            pNow={pNowMonth}
            pLines={pLinesMonth}
        />
    </div>

    <!-- Yearly Flexible -->
    <div slot="tab1">
        <BudgetMonthlyFlexible
            categories={categoriesYearly.filter(isFlexible)}
            pNow={pNowYear}
            pLines={pLinesYear}
        />
    </div>

    <!-- Scheduled -->
    <div slot="tab2">
        <p style="margin-top: 20px; margin-bottom: 20px">Monthly:</p>
        <BudgetMonthlyFlexible
            categories={categoriesMonthly.filter(isScheduled)}
            pNow={pNowMonth}
            pLines={pLinesMonth}
        />

        <p style="margin-top: 20px; margin-bottom: 20px">Yearly:</p>
        <BudgetMonthlyFlexible
            categories={categoriesYearly.filter(isScheduled)}
            pNow={pNowYear}
            pLines={pLinesYear}
        />
    </div>
</Tabs>
