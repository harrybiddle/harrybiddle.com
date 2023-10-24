<script>
    import { onMount } from "svelte";
    import * as d3 from 'd3';

    export let activity;
    export let budgeted;
    export let lines = [];
    export let current = null;

    let containerElement;

    const colours = ({
        blue: "#429EA6",
        green: "#95E06C",
        darkGreen: "#0B5D1E",
        red: "#DA7422",
        grey: "lightgrey"
    });

    function sparkbarCatchUp() {
        // TODO: add a "blue" bar which is for fixed costs
      var makeWidths = () => {
        if (budgeted && current) {
          // budgeted > 0, current > 0
          return [
            [Math.min(current, activity / budgeted), colours.grey], // activity so far
            [Math.max(0, current - activity / budgeted), colours.green], // remaining
            [Math.max(0, activity / budgeted - current), colours.red], // excess
            [Math.max(0, 1 - Math.max(current, activity / budgeted)), colours.grey]
          ];
        } else if (budgeted && !current) {
          // budgeted > 0, current = 0
          return [
            [Math.min(activity / budgeted), colours.grey], // activity so far
            [Math.max(0, 1 - Math.max(current, activity / budgeted)), colours.green]
          ];
        } else if (activity) {
          // budgeted = 0, activity > 0
          return [
            [1, colours.red],
            [1, colours.grey]
          ];
        } else {
          // budgeted = activity = 0
          return [[1, colours.green]];
        }
      };

      return drawBars(makeWidths() || [], lines, current);
    }

    function drawBars(widths, lines, current) {
      const max = d3.sum(widths, (d) => d[0]);

      // create our outer SVG element with a size of 500x100 and select it
      const svg = d3
        .create("svg")
        .attr("viewbox", `0 0 100 100`)
        .attr("width", "100%")
        .attr("height", "100%");

      // draw coloured blocks
      const drawBlock = (x, width, colour) =>
        svg
          .append("rect")
          .attr("x", `${(100 * x) / max}%`)
          .attr("y", "10%")
          .attr("height", "80%")
          .attr("width", `${(100 * width) / max}%`)
          .attr("fill", colour);

      var x = 0;
      for (var [width, colour] of widths) {
        drawBlock(x, width, colour);
        x = x + width;
      }

      // draw white lines at saturdays
      lines.forEach((p) => {
        const x = (100 * p) / max;
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
      if (current !== null) {
        const x = (100 * current) / max;
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

    onMount(() => containerElement.appendChild(sparkbarCatchUp()));
</script>

<div bind:this={containerElement} style="height: 1.2em"></div>
