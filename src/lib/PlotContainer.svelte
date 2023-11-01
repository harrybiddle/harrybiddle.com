<script>
	import * as Plot from '@observablehq/plot';

	export let options;

	function appendPlot(node) {
		node.appendChild(Plot.plot(options));
	}
</script>

{#key options}
<div use:appendPlot {...$$restProps}></div>
{/key}
