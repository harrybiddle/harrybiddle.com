<script>
	import MonthSelect from "./MonthSelect.svelte";
    import { constructMonthstamp, currentMonthstamp, parseMonthstamp } from "./ynab";

    export let firstMonthstamp;
    export let lastMonthstamp;

    // display from two years ago to the next year
    const _currentMonthstamp = currentMonthstamp();
    const currentYear = parseMonthstamp(_currentMonthstamp).year;
    const years = [
        currentYear - 2,
        currentYear - 1,
        currentYear,
        currentYear + 1,
    ];

    // click handlers
    function yearSoFar() {
        firstMonthstamp = constructMonthstamp(currentYear, 0);
        lastMonthstamp = constructMonthstamp(currentYear, 11);
    }
    function threeMonths() {
        firstMonthstamp = _currentMonthstamp - 3;
        lastMonthstamp = _currentMonthstamp - 1;
    }
    function sixMonths() {
        firstMonthstamp = _currentMonthstamp - 6;
        lastMonthstamp = _currentMonthstamp - 1;
    }
    function lastYear() {
        firstMonthstamp = constructMonthstamp(currentYear - 1, 0);
        lastMonthstamp = constructMonthstamp(currentYear - 1, 11);
    }

    // initiate with default values
    sixMonths();

</script>

<style>
    button {
        padding:
            calc(0.5 * var(--form-element-spacing-vertical))
            calc(0.5 * var(--form-element-spacing-horizontal));
    }
    div {
        display: flex;
        gap: 10px;
    }
</style>

<div>
    <!-- First Month ------------------------------------------------------------------>
    <MonthSelect bind:value={firstMonthstamp} {years} />

    <!-- Last Month ------------------------------------------------------------------->
    <MonthSelect bind:value={lastMonthstamp} {years} />
</div>

<!-- Quick buttons -------------------------------------------------------------------->
<div>
    <button class="outline" type="button" on:click={yearSoFar}>Year so far</button>
    <button class="outline" type="button" on:click={threeMonths}>3 months</button>
    <button class="outline" type="button" on:click={sixMonths}>6 months</button>
    <button class="outline" type="button" on:click={lastYear}>Last year</button>
</div>