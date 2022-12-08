<script>
	import * as d3 from 'd3';
	import * as Plot from '@observablehq/plot';
	import PlotContainer from './PlotContainer.svelte';

	export let reversed = false;
	export let data = [];
    export let domainY = [];
</script>


<PlotContainer options={{
	color: {
		type: "categorical",
		legend: true,
		range: reversed ? d3.schemeCategory10.slice().reverse() : d3.schemeCategory10,
		style: { fontSize: "17px" },
	},
	style: { fontFamily: "Gelasio", fontSize: "18px", overflow: true, background: "transparent", },
	marginLeft: 60,
	marginTop: 10,
	marginBottom: 50,
	x: {
		label: "Year",
		// Here we hide some ticks. The "ticks" option seems to be ignored for bar plots :/
		tickFormat: y => y % 5 ? "" : y
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
