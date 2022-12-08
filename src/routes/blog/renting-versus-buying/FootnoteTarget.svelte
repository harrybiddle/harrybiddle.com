<script>
	export let i;
</script>

<p class="footnote">
	<a id="footnote-{i}">
		<sup>{i}</sup>
	</a>
	<slot></slot>
	<a href="#footnote-{i}-return">&#8617;</a>
</p>

<style>
	.footnote {
		font-size: smaller;
	}
</style>
