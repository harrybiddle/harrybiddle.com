<script>
	import * as d3 from 'd3';
	import * as Plot from '@observablehq/plot';
	import PlotContainer from './PlotContainer.svelte';

	export let reversed = false;
	export let data = [];
    export let domainY = [];
</script>

<!-- prettier-ignore -->
<PlotContainer options={{
	color: {
		type: "categorical",
		legend: true,
		range: reversed ? d3.schemeCategory10
		.slice().reverse() : d3.schemeCategory10

	},
	style: { fontFamily: "Gelasio", fontSize: "15px", overflow: true, background: "transparent", },
	marginLeft: 60,
	marginTop: 10,
	marginBottom: 50,
	x: {
		label: "Year",
		// Here we hide the tick every other year. The "ticks" option seems to
		// be ignored for bar plots :/
		tickFormat: y => y % 2 ? "" : y
	},
	y: { tickFormat: "s", domain: domainY },
	marks: [
		Plot.barY(
			data,
			{ x: "year", y: "amount", fill: "category"}
		),
		Plot.ruleY([0], { stroke: "grey" }),
	],
	 }}
/>
