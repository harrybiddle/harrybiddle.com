<script>
    import History from "./History.svelte";

    export let choices;
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
    function setAllCategoriesInGroupCheckedTo(group, checked) {
        categoryStates = categoryStates.map(d => ({...d, checked: d.group === group ? checked : d.checked}))
    }

    let _data;

    function updateData() {
        const checkedGroups = new Set(
            groupStates
                .filter(groupState => groupState.checked)
                .map(groupState => groupState.group),
        );
        const expandedGroups = new Set(
            groupStates
                .filter(groupState => groupState.expanded)
                .map(groupState => groupState.group),
        );
        const checkedCategories = new Set(
            categoryStates
                .filter(categoryState => categoryState.checked)
                .map(categoryState => `${categoryState.group}-${categoryState.category}`),
        );
        const shouldInclude = dataItem =>
            (dataItem.level === 1 && checkedGroups.has(dataItem.group) && !expandedGroups.has(dataItem.group)) ||
            (dataItem.level === 2 && expandedGroups.has(dataItem.group) && checkedCategories.has(`${dataItem.group}-${dataItem.name}`));

        _data = data.filter(shouldInclude);
    }

    let stacking = "monthly";

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
    names={[...new Set(data.map(d => d.name))]}
    averaged={stacking === "averaged"}
    data={_data}
/>

<article>
    <!-- Stacking options -->
    <fieldset>
      <label for="monthly" class="stackLabel">
        <input bind:group={stacking} type="radio" id="monthly" name="stacking" value="monthly">
        Monthly
      </label>
      <label for="averaged" class="stackLabel">
        <input bind:group={stacking} type="radio" id="averaged" name="stacking" value="averaged">
        Averaged
      </label>
    </fieldset>

    <!-- Select/deselection of all groups -->
    <small>
        <a on:click={() => setAllCheckedTo(true)}>select all</a>
        |
        <a on:click={() => setAllCheckedTo(false)}>select none</a>
    </small>
    <br />
    <br />

    <!-- Selection/expansion of individual groups -->
    <form>
        {#each groupStates as groupState}
            {@const group = groupState.group}
            {@const _categoryStates = categoryStates.filter(d => d.group === group) }
            <details bind:open={groupState.expanded}>
                <summary>
                        <input type="checkbox" id="{group}-checkbox" bind:checked={groupState.checked} name="{group}-checkbox" disabled={groupState.expanded}>
                        {group}
                </summary>
                <div style="margin-left: 50px">
                    <small>
                        <a on:click={() => setAllCategoriesInGroupCheckedTo(group, true)}>select all</a>
                        |
                        <a on:click={() => setAllCategoriesInGroupCheckedTo(group, false)}>select none</a>
                    </small>
                    <fieldset>
                    {#each _categoryStates as categoryState}
                        {@const id=`checkbox-${group}-${categoryState.category}`}
                        <label for={id}>
                            <input type="checkbox" id="{id}" name="{id}" bind:checked={categoryState.checked}>
                            {categoryState.category}
                        </label>
                    {/each}
                    </fieldset>
                </div>
            </details>
        {/each}
    </form>
</article>
