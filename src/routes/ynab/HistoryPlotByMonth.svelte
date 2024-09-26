<script>
    import * as d3 from 'd3'    
    import * as Plot from '@observablehq/plot';

    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format } from "./ynab";

    export let data;
</script>

{#if data.length > 0}
    <PlotContainer
        options={{
            x: { type: "band", tickFormat: d3.utcFormat("%b") },
            y: { grid: true, ticks: 5, tickFormat: d => d3.format(".2s")(d).replace(".0", "") },
            color: { legend: true },
            marks: [
                Plot.axisX(),
                Plot.barY(
                    data, 
                    {
                        x: "month",
                        y: "activity",
                        fill: "name",
                        tip: {format: {y: format, x: d3.utcFormat("%b"), fy: false, fill: true}},
                    },
                ),
            ],
        }}
    />
{:else}
    (No data to show)
{/if}
