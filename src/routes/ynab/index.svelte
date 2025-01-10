<script>
    /* TODO:
     *   - Add 'offset'
     */
    import { writable } from 'svelte/store'
    import BudgetLoader from "./BudgetLoader.svelte";
    import HistoryLoader from "./HistoryLoader.svelte";
	import IncomeHistoryLoader from './IncomeHistoryLoader.svelte';
	import CashflowLoader from './CashflowLoader.svelte';
	import MonthRangePicker from './MonthRangePicker.svelte';
	import Tabs from './Tabs.svelte';

    import { constructMonthstamp } from "./ynab.js";

    const inputtedTokenValue = writable();

    const localStorageIsDefined = () => typeof localStorage !== 'undefined';
    const ynabTokenIsInLocalStorage = () => {
        const v = localStorage.getItem("ynabToken") || "";
        return v.length > 1;
    }
    const ynabToken = () => localStorage.getItem("ynabToken")
    function setYnabToken() {
        localStorage.setItem("ynabToken", $inputtedTokenValue);
        window.location.reload()
    }
    function clearYnabToken() {
        localStorage.removeItem("ynabToken");
        window.location.reload()
    }

    // variables to store the range of months selected by the user
    let firstMonthstamp;
    let lastMonthstamp;
    function rangeArray(a, b) {
        return Array.from({ length: b - a }, (_, i) => a + i);
    }
    $: monthstamps = rangeArray(firstMonthstamp, lastMonthstamp + 1);

    // the current month stamp
    const today = new Date();
    const currentMonthstamp = constructMonthstamp(today.getFullYear(), today.getMonth());
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
            <BudgetLoader ynabToken="{ynabToken()}" monthstamp={currentMonthstamp} day={today.getDate()} />

            <h2>History</h2>

            <MonthRangePicker bind:firstMonthstamp bind:lastMonthstamp />

            <Tabs>
                <div slot="tab0">
                    <HistoryLoader ynabToken="{ynabToken()}" {monthstamps} />
                </div>
                <div slot="tab1">
                    <IncomeHistoryLoader ynabToken="{ynabToken()}" {monthstamps} />
                </div>
                <div slot="tab2">
                    <CashflowLoader ynabToken="{ynabToken()}" {monthstamps} />
                </div>
            </Tabs>

            <button type="button" on:click={clearYnabToken}>Clear YNAB token</button>
        {/if}
    {/if}
</div>
