<script>
    import { loadExpenditure, loadTransfers, parse } from "./ynab"
    import History from "./History.svelte";

    export let ynabToken;
    export let monthstamps;

    const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";

    async function fetchData(_monthstamps) {
        const transfers = await loadTransfers(_monthstamps, ynabToken, budgetId);
        const expenditure = await loadExpenditure(_monthstamps, ynabToken, budgetId);
        return [...parse(expenditure), ...transfers];
    }

    let promise;
    $: promise = fetchData(monthstamps)

</script>

{#await promise}
    <p aria-busy="true">Loading data</p>
{:then categories}
    <History {categories} />
{:catch error}
    <p>Error</p>
{/await}