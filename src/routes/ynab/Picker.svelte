<script>
    import * as d3 from 'd3'

    import History from "./History.svelte";

    export let choices;
    export let facetedAverages;
    export let averages;
    export let data;

    import { beforeUpdate } from 'svelte';

    let groupStates = [...choices.keys()].map(
        group => ({group, checked: true, expanded: false})
    )
    let categoryStates = [...choices.entries()].reduce(
          (accumulator, [group, categories]) => [
              ...accumulator,
              ...categories.map(category => ({group, category, checked: true}))
          ],
          [],
    )
    function setAllCheckedTo(checked) {
        groupStates = groupStates.map(d => ({...d, checked}))
        categoryStates = categoryStates.map(d => ({...d, checked}))
    }
    const checkAll = () => setAllCheckedTo(true);
    const uncheckAll = () => setAllCheckedTo(false);

    let _facetedAverages;
    let _data;
    let _overallAverage;

    function updateData() {
        const checkedGroups = new Set(
            groupStates.filter(d => d.checked).map(d => d.group)
        );
        const groupIsChecked = group => checkedGroups.has(group);
        _facetedAverages = facetedAverages.filter(d => groupIsChecked(d.group));
        _data = data.filter(d => groupIsChecked(d.group));
        _overallAverage = d3.sum(
            [...averages.entries()]
                .filter(([group, _]) => groupIsChecked(group))
                .map(([_, value]) => value)
        )
    }

    let stacking = "stack-bars";

    updateData();  // TODO - is this necessary?
	beforeUpdate(updateData);
</script>

<style>
    .stackLabel {
        display: inline;
        margin-right: 1em;
    }
</style>

<History
    faceted={stacking === "stack-charts"}
    facetedAverages={_facetedAverages}
    overallAverage={_overallAverage}
    data={_data}
/>

<article>
    <!-- Stacking options -->
    <fieldset>
      <label for="stack-bars" class="stackLabel">
        <input bind:group={stacking} type="radio" id="stack-bars" name="stacking" value="stack-bars">
        Stacked Bars
      </label>
      <label for="stack-charts" class="stackLabel">
        <input bind:group={stacking} type="radio" id="stack-charts" name="stacking" value="stack-charts">
        Stacked Charts
      </label>
    </fieldset>

    <!-- Select/deselection of groups and categories -->
    <small>
        <a on:click={checkAll}>select all</a> | <a on:click={uncheckAll}>select none</a>
    </small>
    <br />
    <br />
    <form>
        {#each groupStates as groupState}
            {@const group = groupState.group}
            {@const _categoryStates = categoryStates.filter(d => d.group === group) }
            <details bind:open={groupState.expanded}>
                <summary>
                        <input type="checkbox" id="{group}-checkbox" bind:checked={groupState.checked} name="{group}-checkbox" disabled={groupState.expanded}>
                        {group}
                </summary>
                {#if false}
                    <fieldset>
                    {#each _categoryStates as categoryState}
                        {@const id=`checkbox-${group}-${categoryState.category}`}
                        <label for={id}>
                            <input type="checkbox" id="{id}" name="{id}" bind:checked={categoryState.checked}>
                            {categoryState.category}
                        </label>
                    {/each}
                    </fieldset>
                {/if}
            </details>
        {/each}
    </form>
</article>
