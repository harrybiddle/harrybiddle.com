<!--
  @SparkBarCatchup

  This component assumes the following:

    0 < budgeted
    0 <= expected <= budgeted
    0 <= activity

-->

<script>
    import Bars from "./Bars.svelte";

    import { colours } from "./constants";

    /* A spark bar has the following components:
     *
     *    |    grey     | green1 |||    green2    |
     *    ^             ^         ^               ^
     *    0         activity   expected        budgeted
     *
     * TODO:
     *   - handle budgeted = 0
     *   - display error for negative numbers
     */
    export let activity;
    export let budgeted;
    export let lines;
    export let expected;

    let widths = [];
    $: {

      // build up the widths and colours of the bars
      // first draw the grey & green/red
      widths = [];
      if (activity <= expected) {
          /*
          *    |      grey     | green |||     grey       |
          *    ^               ^        ^                 ^
          *    0             activity expected           budgeted
          */
          widths.push([activity, colours.grey]);
          widths.push([expected - activity, colours.teal]);
          widths.push([budgeted - expected, colours.green]);
      }
      else if (activity <= budgeted) {
          /*
          *    |      grey             ||| orange | green |
          *    ^                        ^         ^       ^
          *    0                    expected  activity budgeted
          */
          widths.push([expected, colours.grey]);
          widths.push([activity - expected, colours.orange]);
          widths.push([budgeted - activity, colours.green]);
      }
      else {
          /*
          *    |      grey             |||     orange     |   red    |
          *    ^                        ^                 ^          ^
          *    0                    expected           budgeted   activity
          */
          widths.push([expected, colours.grey]);
          widths.push([budgeted - expected, colours.orange]);
          widths.push([activity - budgeted, colours.red]);
      }
    }
</script>

<Bars {widths} whiteLines={lines} greyLines={[expected]} />
