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
    function setter(caller) {
        return () => {
            const [a, b] = caller();
            firstMonthstamp = a;
            lastMonthstamp = b;
        }
    }
    function yearSoFar() {
        return [
            constructMonthstamp(currentYear, 0),
            constructMonthstamp(currentYear, 11),
        ];
    }
    function threeMonths() {
        return [
            _currentMonthstamp - 3,
            _currentMonthstamp - 1,
        ];
    }
    function sixMonths() {
        return [
            _currentMonthstamp - 6,
            _currentMonthstamp - 1,
        ];
    }
    function lastYear() {
        return [
            constructMonthstamp(currentYear - 1, 0),
            constructMonthstamp(currentYear - 1, 11),
        ];
    }

    // button styling
    function cls(firstMonthstamp, lastMonthstamp, caller) {
        const [a, b] = caller();
        if (firstMonthstamp === a && lastMonthstamp === b)
            return "";  // filled
        else
            return "outline";
    }

    // initiate with default values
    setter(sixMonths)();

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
    <button type="button"
        class={cls(firstMonthstamp, lastMonthstamp, yearSoFar)}
        on:click={setter(yearSoFar)}
    >Year so far</button>

    <button type="button"
        class={cls(firstMonthstamp, lastMonthstamp, threeMonths)}
        on:click={setter(threeMonths)}
    >3 months</button>

    <button type="button"
        class={cls(firstMonthstamp, lastMonthstamp, sixMonths)}
        on:click={setter(sixMonths)}
    >6 months</button>

    <button type="button"
        class={cls(firstMonthstamp, lastMonthstamp, lastYear)}
        on:click={setter(lastYear)}
    >Last year</button>
</div>