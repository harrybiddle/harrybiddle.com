<script>
    /* TODO:
     *   - Add 'offset'
     */
    import { writable } from 'svelte/store'
    import Budget from "./Budget.svelte";
    import History from "./History.svelte";
	import MonthRangePicker from './MonthRangePicker.svelte';
	import Tabs from './Tabs.svelte';

    import {
        constructMonthstamp,
        loadDataForBudget,
        fetchDataForExpenditureHistory,
        loadIncome,
        loadProfitLoss,
        rangeArray,
    } from "./ynab.js";

    const inputtedTokenValue = writable();

    const localStorageIsDefined = () => typeof localStorage !== 'undefined';
    const ynabTokenIsInLocalStorage = () => {
        const v = localStorage.getItem("ynabToken") || "";
        return v.length > 1;
    }

    function setYnabToken() {
        localStorage.setItem("ynabToken", $inputtedTokenValue);
        window.location.reload()
    }
    function clearYnabToken() {
        localStorage.removeItem("ynabToken");
        window.location.reload()
    }

    // the current month stamp
    const today = new Date();
    const currentMonthstamp = constructMonthstamp(today.getFullYear(), today.getMonth());

    // variables to store the range of months selected by the user
    let firstMonthstamp;
    let lastMonthstamp;

    // Fetching budget
    let budgetPromise = null;
    $: {
        if (localStorageIsDefined()) {
            if (!ynabTokenIsInLocalStorage()) budgetPromise = null;
            else {
                const ynabToken = localStorage.getItem("ynabToken")
                budgetPromise = loadDataForBudget(currentMonthstamp, ynabToken);
            }
        }
    }

    // Fetching history
    // TODO: split into expenditure, income & cashflow history
    let monthstamps = [];
    let profitLossPromise = null;
    let expenditureHistoryPromise = null;
    let incomeHistoryPromise = null;
    $: {
        monthstamps = rangeArray(firstMonthstamp, lastMonthstamp + 1);

        if (localStorageIsDefined()) {
            if (!ynabTokenIsInLocalStorage()) {
                profitLossPromise = null;
                expenditureHistoryPromise = null;
                incomeHistoryPromise = null;
            }
            else {
                const ynabToken = localStorage.getItem("ynabToken")
                profitLossPromise = loadProfitLoss(monthstamps, ynabToken);
                expenditureHistoryPromise = fetchDataForExpenditureHistory(monthstamps, ynabToken);
                incomeHistoryPromise = loadIncome(monthstamps, ynabToken);
            }
        }
    }

</script>

<style>
    label {
        display: inline;
        margin-right: 15px;
    }

    #scaled {
        /* make everything smaller - https://github.com/picocss/pico/discussions/482 */
        transform: scale(0.9);
        transform-origin: top;
    }

</style>

<div id="scaled">
    {#if localStorageIsDefined()}
        {#if !ynabTokenIsInLocalStorage()}
            <article>
                <label>Enter something:</label>
                <input type="text" bind:value={$inputtedTokenValue}>
                <button type="button" on:click={setYnabToken}>Submit</button>
            </article>
        {:else}
            <h3>Budget
                <span style="font-size: medium; font-weight: normal; margin-left: 10px">
                    <a href="https://docs.google.com/spreadsheets/d/1IsFU9ZVMnjgPZKjRL3sbfUH9xiI_EcfYurxNUROtGpI">Edit</a>
                </span>
            </h3>
            {#await budgetPromise}
                <p aria-busy="true">Loading data</p>
            {:then data}
                <Budget
                    categoriesMonthly={data.monthly}
                    categoriesYearly={data.yearly}
                    monthstamp={currentMonthstamp}
                    day={today.getDate()}
                />
            {:catch error}
                <p>Error</p><p>{error}</p>
            {/await}

            <h3>History</h3>
            <MonthRangePicker bind:firstMonthstamp bind:lastMonthstamp />

            <Tabs label0="Expenditure" label1="Income" label2="Profit-Loss">
                <div slot="tab0">
                    <!-- Expenditure History -->
                    {#await expenditureHistoryPromise}
                        <p aria-busy="true">Loading data</p>
                    {:then categories}
                        <History {categories} {monthstamps} />
                    {:catch error}
                        <p>Error</p>
                    {/await}
                </div>
                <div slot="tab1">
                    <!-- Income History -->
                    {#await incomeHistoryPromise}
                        <p aria-busy="true">Loading data</p>
                    {:then categories}
                        <History {categories} {monthstamps} />
                    {:catch error}
                        <p>Error</p>
                    {/await}
                </div>
                <div slot="tab2">
                    {#await profitLossPromise}
                        <p aria-busy="true">Loading data</p>
                    {:then categories}
                        <History {categories} {monthstamps} dual={true} />
                    {:catch error}
                        <p>Error</p>
                    {/await}
                </div>
            </Tabs>

            <button type="button" on:click={clearYnabToken}>Clear YNAB token</button>
        {/if}
    {/if}
</div>
