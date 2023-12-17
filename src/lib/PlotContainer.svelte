<script>
	import * as Plot from '@observablehq/plot';

	export let options;

	function append(node) {
		node.appendChild(Plot.plot(options));
	}
</script>

{#key options}
<div use:append {...$$restProps}></div>
{/key}
