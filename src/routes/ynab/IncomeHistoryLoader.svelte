<script>
    import { loadIncome, parse } from "./ynab"
    import { live } from "./constants"
    import History from "./History.svelte";

    export let ynabToken;
    export let monthstamps;

    const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";

    async function fetchData(_monthstamps) {
        if (live) {
            return loadIncome(_monthstamps, ynabToken, budgetId);
        }
        else {
            return new Promise(resolve => { resolve([]); })
        }
    }

    let promise;
    $: promise = fetchData(monthstamps)

</script>

{#await promise}
    <p aria-busy="true">Loading data</p>
{:then budgets}
    <History categories={parse(budgets)} />
{:catch error}
    <p>Error</p>
{/await}