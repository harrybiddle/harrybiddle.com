<script>
    import * as Plot from '@observablehq/plot';    

    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format } from "./ynab";
    
    export let data;
</script>

{#if data.length > 0}
    <PlotContainer
        options={{
            marginLeft: 120,
            marginRight: 50, // to leave enough space for text mark
            y: { label: null },  // hide y-axis label
            x: { label: "average monthly spend" },
            color: { legend: false },
            marks: [
                Plot.barX(
                    data,
                    {
                        x: "activity",
                        y: "name",
                        fill: "name",
                        tip: { format: { x: format, fill: false } },
                        sort: d => d.activity,
                    },
                ),
                Plot.text(
                    data,
                    {
                        x: "activity",
                        y: "name",
                        text: d => format(d.activity),
                        lineAnchor: "middle",
                        textAnchor: "start",
                        dx: 5
                    },
                ),
            ],
        }} 
    /> 
{:else}
    (No data to show)
{/if}
