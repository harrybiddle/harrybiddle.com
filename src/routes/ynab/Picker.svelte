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
    function setCategoriesInGroupCheckedTo(group, checked) {
        categoryStates = categoryStates.map(
            d => ({...d, checked: d.group === group ? checked : d.checked})
        )
    }
    function setAllGroupCheckedTo(checked) {
        groupStates = groupStates.map(d => ({...d, checked}))
    }

    let _facetedAverages;
    let _data;
    let _overallAverage;

    function updateData() {
        const checkedGroups = new Set(
            groupStates.filter(d => d.checked).map(d => d.group)
        );
        const filter = d => checkedGroups.has(d.group)
        _facetedAverages = facetedAverages.filter(filter);
        _data = data.filter(filter);
        _overallAverage = d3.sum(
            [...averages.entries()]
                .filter(([group, value]) => checkedGroups.has(group))
                .map(([group, value]) => value)
        )
    }

	beforeUpdate(updateData);
</script>

<History
    facetedAverages={_facetedAverages}
    overallAverage={_overallAverage}
    data={_data}
/>

<article>
    <small>
        <a on:click={() => setAllGroupCheckedTo(true)}>select all</a>
        |
        <a on:click={() => setAllGroupCheckedTo(false)}>select none</a>
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
                        <small>
                            <a on:click={() => setCategoriesInGroupCheckedTo(group, true)}>select all</a>
                            |
                            <a on:click={() => setCategoriesInGroupCheckedTo(group, false)}>select none</a>
                        </small>
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
