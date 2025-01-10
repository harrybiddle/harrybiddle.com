<script>
    import { loadExpenditure, parseMonthstamp } from "./ynab"
    import Budget from "./Budget.svelte";

    export let ynabToken;
    export let monthstamp;
    export let day;

    const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";

    async function fetchData(_monthstamp) {
        const categories = await loadExpenditure([_monthstamp], ynabToken, budgetId);

        return categories
            // keep only the current month
            .filter(d => d.monthstamp === monthstamp)
            // exclude yearly categories - these are in a different widget
            .filter(e => !e.is_yearly)
            // exclude scheduled categories - these are in a different widget
            .filter(e => !e.is_scheduled)
            // exclude categories that are taken from savings rather than regular income
            .filter(e => !e.from_savings)
        ;
    }

    let promise;
    let pNow = 0;
    let pLines = []
    $: {
        promise = fetchData(monthstamp);

        // calculate how far along the month we are
        const { month } = parseMonthstamp(monthstamp);
        const monthLengths = [
            31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
        ]
        const daysInMonth = monthLengths[month];
        pNow = day / daysInMonth;

        // TODO: fill lines with position of saturdays
        pLines = [];
    }

</script>

{#await promise}
    <p aria-busy="true">Loading data</p>
{:then categories}
    <Budget {categories} {pNow} {pLines} />
{:catch error}
    <p>Error</p>
{/await}
