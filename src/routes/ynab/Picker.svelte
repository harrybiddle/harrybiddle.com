<script>
    export let choices;

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
    function setGroupExpandedTo(group, expanded) {
        groupStates = groupStates.map(
            d => ({...d, expanded: d.group === group ? expanded : d.expanded})
        )
    }
    function setGroupCheckedTo(group, checked) {
        groupStates = groupStates.map(
            d => ({...d, checked: d.group === group ? checked : d.checked})
        )
    }
</script>

<style>
    .expander {
        width: 23px;
        height: 23px;
        padding: 2px;
    }
</style>

<article>
    <form>
        {#each groupStates as groupState}
            {@const group = groupState.group}
            {@const _categoryStates = categoryStates.filter(d => d.group === group) }
            <details bind:open={groupState.expanded}>
                <summary>
                        <input type="checkbox" id="{group}-checkbox" bind:checked={groupState.checked} name="{group}-checkbox" disabled={groupState.expanded}>
                        {group}
                </summary>
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
            </details>
        {/each}
    </form>
</article>
