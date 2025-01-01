<script>
    import { parseMonthstamp, constructMonthstamp } from "./ynab";

    export let value;
    export let years;
</script>

<style>
    select {
        padding-top: calc(0.5 * var(--form-element-spacing-vertical));
        padding-bottom: calc(0.5 * var(--form-element-spacing-vertical));
    }
</style>

<select bind:value={value}>
    {#each years as year}
        <optgroup label={year}>
            {#each Array(12).fill(0).map((_, i) => i) as month}
                {@const monthstamp = constructMonthstamp(year, month)}
                {@const parsed = parseMonthstamp(monthstamp)}
                <option value={monthstamp}>{parsed.monthString}</option>
            {/each}
        </optgroup>
    {/each}
</select>