<script>
    import { onMount } from "svelte";
    import { ynab } from "./ynab"
    import Budget from "./Budget.svelte";

    export let ynabToken;

    const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";
    const month = "2023-10-01";

    let categories;
    let budget;
    onMount(async () => {
        categories = await ynab(ynabToken, `budgets/${budgetId}/categories`, {});
        budget = await ynab(ynabToken, `budgets/${budgetId}/months/${month}`, {});
    });

</script>

{#if categories && budget}
    <Budget {categories} {budget} />
{:else}
    <p aria-busy="true">Loading data</p>
{/if}
