<script>
    import { ynab } from "./ynab"
    import OneOff from "./OneOff.svelte";

    export let ynabToken;
    export let month;

    // --------------------------------------------------------------------------------

    const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";

    function fetchData(month) {
        const months = [
          month.subtract(0, "month"),
          month.subtract(1, "month"),
          month.subtract(2, "month"),
          month.subtract(3, "month"),
          month.subtract(4, "month"),
          month.subtract(5, "month"),
          month.subtract(6, "month"),
          month.subtract(7, "month"),
          month.subtract(8, "month"),
          month.subtract(9, "month"),
          month.subtract(10, "month"),
          month.subtract(11, "month")
        ].filter((m) => m.year() == month.year())

        // TODO: do we need to fetch the whole budget?
        return Promise.all(
            months.map(month => {
                const monthString = month.format("YYYY-MM-DD");
                return ynab(ynabToken, `budgets/${budgetId}/months/${monthString}`, {})
            })
        );
    }

    let promise;
    $: promise = fetchData(month);

</script>

{#await promise}
    <p aria-busy="true">Loading data</p>
{:then budgets}
    <OneOff {budgets} />
{:catch error}
    <p>Error</p>
{/await}
