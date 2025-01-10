<script>
    import { loadExpenditure, loadIncome, loadTransfers, parse } from "./ynab"
    import History from "./History.svelte";

    export let ynabToken;
    export let monthstamps;

    const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";

    const houseRenovationCategoryId = "b71f58f0-adee-4120-b7e0-968517141326";  // One-Off, House

    async function fetchData(_monthstamps) {

        // fetch data. TODO: do we need to fetch the whole budget?

        const income = await loadIncome(_monthstamps, ynabToken, budgetId);
        const expenditure = await loadExpenditure(_monthstamps, ynabToken, budgetId);
        const transfers = await loadTransfers(_monthstamps, ynabToken, budgetId, true);

        // pull out house renovation category into its own group
        const parsedExpenditure = parse(expenditure).map(d => ({...d, activity: -d.activity}));
        parsedExpenditure.forEach(d => {
            if (d.category_id === houseRenovationCategoryId) {
                d.group = "House Renovation";
                d.group_id = "gHouseRenovation";
            }
        });

        return [
            ...parse(income),
            ...parsedExpenditure,
            ...transfers.map(d => ({...d, activity: -d.activity}))
        ];
    }

    let promise;
    $: promise = fetchData(monthstamps)

</script>

{#await promise}
    <p aria-busy="true">Loading data</p>
{:then categories}
    <History {categories} dual={true} />
{:catch error}
    <p>Error {error.message}</p>
{/await}