<script>
    import * as Plot from '@observablehq/plot';

    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format } from "./ynab";

    export let data;
</script>

{#if data.length > 0}
    <PlotContainer
        options={{
            style: { fontSize: "15.75px", fontFamily: "PT Sans,sans-serif", overflow: false, background: "transparent", },
            marginLeft: 150,
            marginRight: 50, // to leave enough space for text mark
            marginBottom: 50,
            y: { label: null },  // hide y-axis label
            x: { label: "average monthly spend" },
            color: { legend: false },
            marks: [
                Plot.barX(
                    data,
                    {
                        fontSize: 16,
                        x: "activity",
                        y: "name",
                        fill: "name",
                        tip: { format: { x: format, fill: false } },
                        sort: {y: "-x"},
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
