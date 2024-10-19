<script>
    import { loadIncome } from "./ynab"
    import { live } from "./constants"
    import History from "./History.svelte";

    import * as d3 from 'd3';

    export let ynabToken;
    export let month;
    export let period;

    const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";    

    // get the last 24 months
    // this is sufficiently large to cover all periods
    // (this year / last year / last six months)
    let allMonths = Array.from({ length: 24 }, (_, index) => month.subtract(index + 1, "month"));

    const thisYear = month.year();

    function fetchData(period) {
        // filter to the right period        
        // we default to period === "yearSoFar"
        const yearSoFar = allMonths.filter(m => m.year() === thisYear);

        let months = yearSoFar; 

        if (period === "lastSixMonths") {
            months = Array.from({length: 6}, (_, index) => month.subtract(index + 1, "month"));
        } 
        else if (period === "lastTwelveMonths") {
            months = Array.from({length: 12}, (_, index) => month.subtract(index + 1, "month"));
        } 
        else if (period === "lastYear") {
            const lastYear = thisYear - 1;
            months = allMonths.filter(m => m.year() === lastYear)
        }
        
        if (live) {
            return loadIncome(months, ynabToken, budgetId);
        }
        else {
            return new Promise(resolve => { resolve([]); })
        }
    }

    let promise;
    $: promise = fetchData(period)

</script>

{#await promise}
    <p aria-busy="true">Loading data</p>
{:then budgets}    
    <History {budgets} />
{:catch error}
    <p>Error</p>
{/await}