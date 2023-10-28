<script>

    import { writable } from 'svelte/store'
    import BudgetLoader from "./BudgetLoader.svelte";
    import SparkBarCatchUp from "./SparkBarCatchUp.svelte";
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
</script>
{#if localStorageIsDefined()}
    {#if !ynabTokenIsInLocalStorage()}
       <article>
            <label>Enter something:</label>
            <input type="text" bind:value={$inputtedTokenValue}>
            <button type="button" on:click={setYnabToken}>Submit</button>
        </article>
    {:else}
        <BudgetLoader ynabToken="{ynabToken()}" />

        <button type="button" on:click={clearYnabToken}>Clear YNAB token</button>
    {/if}
{:else}
{/if}
