<script>
    import { onMount } from "svelte";
    import * as d3 from 'd3';

    export let widths;
    export let whiteLines = [];
    export let greyLines = [];

    let containerElement;

    function drawBars(_widths) {
      const filteredWidths = _widths.filter(d => Math.abs(d[0]) > 0);
      const totalWidth = d3.sum(filteredWidths, (d) => d[0]);

      // create our outer SVG element and select it
      const svg = d3
        .create("svg")
        .attr("viewbox", `0 0 100 100`)
        .attr("width", "100%")
        .attr("height", "1.2em");

      // draw coloured blocks
      const drawBlock = (x, width, colour) =>
        svg
          .append("rect")
          .attr("x", `${(100 * x) / totalWidth}%`)
          .attr("y", "2%")  // unsure why but this puts it in the middle...
          .attr("height", "80%")
          .attr("width", `${(100 * width) / totalWidth}%`)
          .attr("fill", colour);

      var x = 0;
      for (var [width, colour] of filteredWidths) {
        drawBlock(x, width, colour);
        x = x + width;
      }

      // draw white lines
      whiteLines.forEach((p) => {
        const x = (100 * p) / totalWidth;
        svg
          .append("line")
          .attr("x1", `${x}%`)
          .attr("y1", "2%")  // unsure why but this puts it in the middle...
          .attr("x2", `${x}%`)
          .attr("y2", "90%")
          .attr("stroke", "white")
          .attr("stroke-width", "1");
      });

      // draw grey lines
      greyLines.forEach((p) => {
        const x = (100 * p) / totalWidth;
        svg
          .append("line")
          .attr("x1", `${x}%`)
          .attr("y1", "0")
          .attr("x2", `${x}%`)
          .attr("y2", "100%")
          .attr("stroke", "slategray")
          .attr("stroke-width", "3");
      });

      return svg.node();
    }

    onMount(() => containerElement.appendChild(drawBars(widths)));
</script>

<div bind:this={containerElement}></div>
