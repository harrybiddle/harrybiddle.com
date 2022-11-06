<!--
This is an <input /> element intended to store large integer numbers. It will display
the number to the user using the locale formatting. For example, 1000 becomes "1,000".

Unfortunately you cannot enter floating-point numbers since as soon as you type
"3." it will instantly become "3", before you can even type the next digit! For this
reason, negative numbers also won't work.
-->

<script>
	export let wide = false;
	export let value;

	// Mike Bostock's number parser
	// https://observablehq.com/@mbostock/localized-number-parsing
	class NumberParser {
		constructor(locale) {
			const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
			const numerals = [
				...new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210)
			].reverse();
			const index = new Map(numerals.map((d, i) => [d, i]));
			this._group = new RegExp(`[${parts.find(d => d.type === 'group').value}]`, 'g');
			this._decimal = new RegExp(`[${parts.find(d => d.type === 'decimal').value}]`);
			this._numeral = new RegExp(`[${numerals.join('')}]`, 'g');
			this._index = d => index.get(d);
		}
		parse(string) {
			return (string = string
				.trim()
				.replace(this._group, '')
				.replace(this._decimal, '.')
				.replace(this._numeral, this._index))
				? +string
				: NaN;
		}
	}

	// apply formatting for the initial value
	const formatter = new Intl.NumberFormat();
	let formattedValue = formatter.format(value);

	// add a handler every time the value is modified
	const parser = new NumberParser();
	function update(event) {
		// ignore arrow keys
		if ([38, 40, 37, 39].includes(event.keyCode)) return;

		// parse the string to a number and update our prop
		value = parser.parse(event.target.value);

		// format the number to update the input element
		event.target.value = formatter.format(value);
	}
</script>

<input
	style="text-align: right; width: {wide ? '6em' : '4em'}"
	on:keyup="{update}"
	bind:value="{formattedValue}"
/>
