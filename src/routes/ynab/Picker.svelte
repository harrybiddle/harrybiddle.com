<!--
    Choices should be an array of objects:

       [
          {
              id: "a",
              label: "Scheduled",
              show: true,
              expanded: true,
              children: [
                {
                  id: "a1",
                  label: "Rent"
                  show: false
                },
                ...
              ]
           },
           ...
       ]

-->
<script>
  import CustomCheckbox from "./CustomCheckbox.svelte";

  export let choices;
  export let defaultChoices = undefined;

  function reset() { choices = structuredClone(defaultChoices); }

  function setAllChildrenTo(id, key, state) {
    choices = choices.map(
      choice => ({
        ...choice,
        children: choice.children.map(
          child => ({
            ...child,
            [key]: id === choice.id ? state: child[key]
          })
        )
      })
    )
  }

  function choiceShownButAllChildrenHidden(choice) {
    const childrenHidden = choice.children.every(child => !child.show);
    return choice.show && childrenHidden
  }

  function choiceShownButChildrenAreMixed(choice) {
    const childrenMixed = new Set(choice.children.map(child => child.show)).size > 1;
    return choice.show && childrenMixed;
  }

  function setAllChoicesTo(state) {
    choices = choices.map(choice => ({...choice, show: state}))
  }

  function averageNothing() {
    choices = choices.map(
      choice => ({
        ...choice,
        children: choice.children.map(
          child => ({ ...child, average: false })
        )
      })
    );
  }

</script>

<style>
  details[open] > summary {
    margin-bottom: calc(var(--spacing) * 0.25)
  }
  #options {
    margin-bottom: calc(var(--spacing) * 0.75)
  }
</style>

<div id="options">
  <a on:click={() => setAllChoicesTo(true)}>select all</a>
  |
  <a on:click={() => setAllChoicesTo(false)}>select none</a>
  |
  <a on:click={averageNothing}>average none</a>
  {#if defaultChoices}
    |
    <a on:click={reset}>reset</a>
  {/if}
</div>

{#each choices as choice}
  <details bind:open={choice.expanded}>
    <summary>
      <input bind:checked={choice.show} type="checkbox" />
      {choice.label}
      {#if choiceShownButChildrenAreMixed(choice)}<sup style="color: #D93526">&#8226;</sup>{/if}
      {#if choiceShownButAllChildrenHidden(choice)}⚠️{/if}
    </summary>
    <div style="margin-left: 40px">
      <div style="display: flex; justify-content: space-between">
        <small>
          <a on:click={() => setAllChildrenTo(choice.id, "show", true)}>select all</a>
          |
          <a on:click={() => setAllChildrenTo(choice.id, "show", false)}>none</a>
        </small>
        <small>
          <a on:click={() => setAllChildrenTo(choice.id, "average", true)}>average all</a>
          |
          <a on:click={() => setAllChildrenTo(choice.id, "average", false)}>none</a>
        </small>
      </div>
      <fieldset>
        {#each choice.children as child}
          <label class="child-container">
            <input bind:checked={child.show} type="checkbox" />
            {child.label}
            <span style="float: right">
              <CustomCheckbox bind:checked={child.average} />
            </span>
          </label>
        {/each}
      </fieldset>
    </div>
  </details>
{/each}