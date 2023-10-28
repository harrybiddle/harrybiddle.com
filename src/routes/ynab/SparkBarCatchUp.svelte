<script>
    /* A spark bar has the following components:
     *
     * *                              current
     * p=        0                       v             1
     *    | blue |     grey     | green |||    grey    |
     *    ^      ^              ^                      ^
     * e= 0   scheduled      activity               budgeted
     *
     *
     */
    import { onMount } from "svelte";
    import * as d3 from 'd3';

    export let activity;
    export let budgeted;
    export let scheduled;
    export let lines;
    export let current;

    let containerElement;

    const colours = ({
        blue: "#429EA6",
        green: "#95E06C",
        darkGreen: "#0B5D1E",
        red: "#DA7422",
        grey: "lightgrey"
    });

    // build up the widths and colours of the bars
    // first draw the blue bar of scheduled activity
    let widths = [];
    widths.push([scheduled, colours.blue]);

    // now the grey & green/red
    if (activity <= current) {
        /*
         *    | blue |     grey     | green |||     grey       |
         *    ^      ^              ^        ^                 ^
         * e= 0   scheduled      activity currentT          budgeted
         */
        widths.push([activity - scheduled, colours.grey]);
        widths.push([current - activity, colours.green]);
        widths.push([budgeted - current, colours.grey]);
    }
    else {
        /*
         *    | blue |     grey             |||  red  |  grey  |
         *    ^      ^                       ^        ^        ^
         * e= 0   scheduled              currentT   activity budgeted
         *
         * or
          *    | blue |     grey             |||             red         |
         *    ^      ^                       ^                           ^
         * e= 0   scheduled              currentT                      activity
         */
        widths.push([current - scheduled, colours.grey]);
        widths.push([activity - current, colours.red]);
        widths.push([Math.max(0, budgeted - activity), colours.grey]);
    }

    // remove any zero widths to avoid unnecessary SVG objects
    // TODO: what about negative widths?
    widths = widths.filter(d => Math.abs(d[0]) > 0);

    console.log(widths);

    function drawBars() {
      const totalWidth = d3.sum(widths, (d) => d[0]);

      // create our outer SVG element and select it
      const svg = d3
        .create("svg")
        .attr("viewbox", `0 0 100 100`)
        .attr("width", "100%")
        .attr("height", "100%");

      // draw coloured blocks
      const drawBlock = (x, width, colour) =>
        svg
          .append("rect")
          .attr("x", `${(100 * x) / totalWidth}%`)
          .attr("y", "10%")
          .attr("height", "80%")
          .attr("width", `${(100 * width) / totalWidth}%`)
          .attr("fill", colour);

      var x = 0;
      for (var [width, colour] of widths) {
        drawBlock(x, width, colour);
        x = x + width;
      }

      // draw white lines at saturdays
      lines.forEach((p) => {
        const x = (100 * p) / totalWidth;
        svg
          .append("line")
          .attr("x1", `${x}%`)
          .attr("y1", "10%")
          .attr("x2", `${x}%`)
          .attr("y2", "90%")
          .attr("stroke", "white")
          .attr("stroke-width", "1");
      });

      // draw grey lines at today
      {
        const x = (100 * current) / totalWidth;
        svg
          .append("line")
          .attr("x1", `${x}%`)
          .attr("y1", "0")
          .attr("x2", `${x}%`)
          .attr("y2", "100%")
          .attr("stroke", "slategray")
          .attr("stroke-width", "3");
      }

      return svg.node();
    }

    onMount(() => containerElement.appendChild(drawBars()));
</script>

<div bind:this={containerElement} style="height: 1.2em"></div>
