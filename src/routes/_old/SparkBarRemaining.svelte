<!--
  @SparkBarRemaining

  This component assumes the following:

    0 < budgeted
    0 <= activity

-->

<script>
    import Bars from "./Bars.svelte";

    import { colours } from "./constants";

    export let activity;
    export let budgeted;
    export let lines;

    let widths = [];
    $: {
      // build up the widths and colours of the bars
      // first draw the grey & green/red
      widths = [];
      if (activity <= budgeted) {
          /*
          *    |      grey     |     green    |
          *    ^               ^              ^
          *    0             activity      budgeted
          */
          widths.push([activity, colours.grey]);
          widths.push([budgeted - activity, colours.green]);
      }

      else {
          /*
          *    |             grey             |   red   |
          *    ^                              ^         ^
          *    0                          budgeted   activity
          */
          widths.push([budgeted, colours.grey]);
          widths.push([activity - budgeted, colours.red]);
      }
    }
</script>

<Bars {widths} whiteLines={lines} />
