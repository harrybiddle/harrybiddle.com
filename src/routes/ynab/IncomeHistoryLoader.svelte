<script>
    import { ynab } from "./ynab"
    import { live } from "./constants"
    import History from "./History.svelte";

    import * as d3 from 'd3';

    export let ynabToken;
    export let month;
    export let period;

    const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";
    const incomeCategoryId = "f9fc70b0-df3c-42a9-a49b-76a1e90c4fe8";

    // get the last 24 months
    // this is sufficiently large to cover all periods
    // (this year / last year / last six months)
    let allMonths = Array.from({ length: 24 }, (_, index) => month.subtract(index + 1, "month"));

    const thisYear = month.year();

    function addOneMonth(my_date) {
        let newDate = new Date(my_date);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
    }

    function parsePayee(payee_name, payee_id) { 
        if (!payee_name) {
            return ({
                category_group_id: "other", 
                category_group_name:"Other", 
                id: "uncategorised", 
                name: "Uncategorised",
            });
        }
        const i = payee_name.indexOf("|");

        if (i === -1) {
            return ({
                category_group_id: "other", 
                category_group_name:"Other", 
                id: `p${payee_id}`, 
                name: payee_name,
            });
        } else {
            const group = payee_name.substring(0, i).trim();
            const category = payee_name.substring(i + 1).trim();
            return ({
                category_group_id: group, 
                category_group_name: group, 
                id: payee_id, 
                name: category,
            });
        }
    }

    async function fetchData(period) {
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

            const m = months.sort(d3.ascending);    
            const firstMonth = m[0];
            const lastMonth = addOneMonth(m[m.length - 1]);            

            const response = await ynab(
                ynabToken, 
                `budgets/${budgetId}/categories/${incomeCategoryId}/transactions`, 
                {since_date: firstMonth.format("YYYY-MM-DD")},
            )
            
            const transactions = response["transactions"].filter(
                t => new Date(t.date) < lastMonth
            );

            const data = d3.flatGroup(
                transactions,
                t => t.date.substring(0, 7) + "-01",  // "2024-01-06" -> "2024-01-01"                
            ).map(
                ([monthString, ts]) => ({
                    month: ({
                        month: monthString,
                        categories: d3.flatRollup(
                            ts,
                            ts_ => d3.sum(ts_, t => t.amount),
                            t => t.payee_name,
                            t => t.payee_id,
                        ).map(
                            ([payee_name, payee_id, amount]) => ({
                                activity: -amount,
                                ...parsePayee(payee_name, payee_id),
                            }),
                        )
                    })
                })
            ) 

            // TODO: add any missing months

            return data;
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