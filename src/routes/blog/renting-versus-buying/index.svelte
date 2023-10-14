<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js" integrity="sha512-csNcFYJniKjJxRWRV1R7fvnXrycHP6qDR21mgz1ZP55xY5d+aHLfo9/FcGDQLfn2IfngbAHd8LdfsagcCqgTcQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js" integrity="sha512-SGWgwwRA8xZgEoKiex3UubkSkV1zSE1BS6O4pXcaxcNtUlQsOmOmhVnDwIvqGRfEmuz83tIGL13cXMZn6upPyg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</svelte:head>

<!--TODO:-->
<!-- - Store FileSaver and papaparse in this repository rather than fetching from cdnjs -->
<!-- - Remove special text boxes with commas: just not working!-->
<!-- - Change purchase costs to %-->
<!-- - Generally review all parameters & default values -->
<!-- - Consider expandable dropdown for references, rather than footnotes-->
<!-- - Fix default rent inflation-->
<!-- - Add monte-carlo simulation-->
<!-- - Add mathematical analysis-->
<!-- - Modelling assumptions -->
<!-- - Sensitivity analyses uses current parameters -->
<!-- - Preview of results before download -->
<!-- - consistent legend colours in net worth graphs -->

<script>
	import * as d3 from 'd3';
	import * as Plot from '@observablehq/plot';
	import { simulate, netWorthChartData, camelToWord, calculateNetWorth, prepareDataForCsvDownload } from './simulation';
	import PlotContainer from './PlotContainer.svelte';
	import NetWorthChart from './NetWorthChart.svelte';
	import FootnoteTarget from "./FootnoteTarget.svelte";
	import FootnoteSource from "./FootnoteSource.svelte";
	import { resetParametersToDefaults, localStorageStore } from './parameters.js';

	// helper objects --------------------------------------------------------------- //
	const format = x => d3.format(',.2r')(Math.round(x / 10) * 10);
	const formatIntersection = d => `${Math.abs(d) < 0.1 ? 0 : d.toFixed(1)} years`;
	const plotStyle = { fontFamily: "Gelasio", fontSize: "18px", overflow: true, background: "transparent" };
	let showingMoreParameters = false;

	// model parameters ------------------------------------------------------------- //
	const areaM2 = 73;
	const _housePrice = 5_128 * areaM2;
	const twoSF = x => parseFloat(x.toPrecision(2));

	const maxYears = localStorageStore("maxYears", 30, x => Math.min(x, 100));
	const stockMarketGain = localStorageStore("stockMarketGain", 7);  // percentage per year
	const capitalGainsTax = localStorageStore("capitalGainsTax", 26);  // percentage per year
	const rent = localStorageStore("rent", twoSF(12.78 * areaM2));  // money per month
	const rentGain = localStorageStore("rentGain", 3);  // percentage per year
	const housePrice = localStorageStore("housePrice", twoSF(_housePrice));  // money
	const housePriceGain = localStorageStore("housePriceGain", 3.2);  // percentage per year
	const downPayment = localStorageStore("downPayment", twoSF(0.26 * _housePrice));  // money
	const oneOffCost = localStorageStore("oneOffCost", twoSF(0.1564 * _housePrice));  // money
	const interest = localStorageStore("interest", 3.89);  // percentage per year
	const amortisation = localStorageStore("amortisation", 2);  // percentage per year
	const fixedCost = localStorageStore("fixedCost", twoSF(2.29 * 1.22 * areaM2));  // money per month
	const fixedCostGain = localStorageStore("fixedCostGain", 2.8);  // percentage per year
	const proportionalCost = localStorageStore("proportionalCost", 0.13);  // percentage

	// simulate --------------------------------------------------------------------- //
	let data, netWorth, cash;
	$: {
		data = simulate(
			$amortisation,
			$capitalGainsTax,
			$downPayment,
			$fixedCostGain,
			$fixedCost,
			$housePrice,
			$housePriceGain,
			$interest,
			$maxYears,
			$oneOffCost,
			$proportionalCost,
			$rent,
			$rentGain,
			$stockMarketGain,
		);
		cash = data.filter(r => r.cashExpenditure)
		netWorth = data.filter(r => r.netWorthContributor)
	}

	// results of sensitivity analysis
	const sensitivityBase = 8.718017178214817;
	const sensitivityData = [
	  {"parameter": "housePriceGain", "modification": "Decrease by 20%", "value": 24.65521883522328},
	  {"parameter": "housePriceGain", "modification": "Increase by 20%", "value": 5.025395666258443},
	  {"parameter": "rent", "modification": "Decrease by 20%", "value": 16.431609878339145},
	  {"parameter": "rent", "modification": "Increase by 20%", "value": 4.932022458697653},
	  {"parameter": "interest", "modification": "Decrease by 20%", "value": 5.784751891333453},
	  {"parameter": "interest", "modification": "Increase by 20%", "value": 12.971362995486418},
	  {"parameter": "housePrice", "modification": "Decrease by 20%", "value": 6.2556627157217575},
	  {"parameter": "housePrice", "modification": "Increase by 20%", "value": 11.504965844448627},
	  {"parameter": "proportionalCost", "modification": "Decrease by 20%", "value": 6.896937613100356},
	  {"parameter": "proportionalCost", "modification": "Increase by 20%", "value": 11.548767674084452},
	  {"parameter": "fixedCost", "modification": "Decrease by 20%", "value": 6.793252874084687},
	  {"parameter": "fixedCost", "modification": "Increase by 20%", "value": 11.416614337430197},
	  {"parameter": "oneOffCost", "modification": "Decrease by 20%", "value": 7.065110693929245},
	  {"parameter": "oneOffCost", "modification": "Increase by 20%", "value": 10.335370055798478},
	  {"parameter": "stockMarketGain", "modification": "Decrease by 20%", "value": 7.6443199153483885},
	  {"parameter": "stockMarketGain", "modification": "Increase by 20%", "value": 10.349869227763095},
	  {"parameter": "downPayment", "modification": "Decrease by 20%", "value": 9.906460606878042},
	  {"parameter": "downPayment", "modification": "Increase by 20%", "value": 7.631987762635039},
	  {"parameter": "amortisation", "modification": "Decrease by 20%", "value": 8.083547902334809},
	  {"parameter": "amortisation", "modification": "Increase by 20%", "value": 9.337558364441904},
	  {"parameter": "rentGain", "modification": "Decrease by 20%", "value": 9.035961716021573},
	  {"parameter": "rentGain", "modification": "Increase by 20%", "value": 8.437096851276502},
	  {"parameter": "fixedCostGain", "modification": "Decrease by 20%", "value": 8.493024914230151},
	  {"parameter": "fixedCostGain", "modification": "Increase by 20%", "value": 8.979151913771023},
	];

	function downloadResultsAsCsv() {
		console.log(prepareDataForCsvDownload(data))
		const dataString = Papa.unparse(prepareDataForCsvDownload(data));
		const blob = new Blob([dataString], { type: "text/csv;charset=utf-8" });
		saveAs(blob, "results.csv");
	}


</script>

<header>
	<hgroup>
		<h2>Renting versus buying</h2>
		<h3>November 2022</h3>
	</hgroup>
	<p style="color: var(--muted-color)">
		A simple numerical simulation of how the choice affects your net worth.
	</p>
</header>
<hr />
<p>
	Should I buy, or should I rent? On the face of it it seems like a house would be a
	sort of savings account. All that money you would have otherwise lost to rent! Yet
	there are also big financial downsides to buying property, such as the interest
	payments you lose servicing your debt, or the opportunity cost of not investing in
	the stock market.
</p>
<p>
	Let's build a simple model to investigate the trade-off, with the following
	parameters:
</p>
<table id="parametersTable"><tbody>
	<tr>
		<td>Starting capital</td>
		<td><input type="number" bind:value={$downPayment} /></td>
	</tr>
	<tr>
		<td>House price<FootnoteSource i="3" /></td>
		<td><input type="number"  bind:value="{$housePrice}" /></td>
	</tr>
	<tr>
		<td>Rent, inclusive of all utilities and heating costs<FootnoteSource i="1" /></td>
		<td><input type="number"  bind:value="{$rent}" /> per month</td>
	</tr>
	<tr>
		<td>Interest on the loan</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{$interest}" />%
			per year<FootnoteSource i="5" />
		</td>
	</tr>
	<tr>
		<td colspan="2" style="text-align: center">
			<a on:click={() => (showingMoreParameters = !showingMoreParameters)}>
				<small>Show {showingMoreParameters ? 'fewer' : 'more'} parameters</small>
			</a>
		</td>
	</tr>
	{#if showingMoreParameters}
	<tr>
		<td>Rent inflation</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{$rentGain}" />% per
			year<FootnoteSource i="11" />
		</td>
	</tr>
	<tr>
		<td>Purchase cost (property transfer tax, notary fees, and so on)<FootnoteSource i="4" /></td>
		<td><input type="number" bind:value="{$oneOffCost}" /> (or
	{d3.format(".0%")($oneOffCost / $housePrice)} of the house
	price)</td>
	</tr>
	<tr>
		<td>House price growth</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value={$housePriceGain} />% per
			year<FootnoteSource i="10" />
		</td>
	</tr>
	<tr>
		<td>Amortisation of the loan</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{$amortisation}" />%
			per year<FootnoteSource i="6" />
		</td>
	</tr>
	<tr>
		<td>Costs proportional to the house value such as property tax</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{$proportionalCost}" />% of the
			value of the house per year<FootnoteSource i="7" />
		</td>
	</tr>
	<tr>
		<td>Fixed costs such as utilities and maintenance</td>
		<td>
			<input type="number" bind:value="{$fixedCost}" /> per
			month, or {d3.format(".1%")(12 * $fixedCost / $housePrice)} of the value of
			the house per year<FootnoteSource i="8" />
		</td>
	</tr>
	<tr>
		<td>Inflation of fixed costs</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{$fixedCostGain}" />% per
			year<FootnoteSource i="12" />
		</td>
	</tr>
	<tr>
		<th colspan="2">Market conditions</th>
	</tr>
	<tr>
		<td>Stock market growth</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{$stockMarketGain}" />% per
			year<FootnoteSource i="9" />
		</td>
	</tr>
	<tr>
		<td>Capital gains tax<FootnoteSource i="13" />. House price growth is not taxed (annual property tax is included in Buy's proportional costs).</td>
		<td><input type="number" style="text-align: right; width: 4em" bind:value="{$capitalGainsTax}" />% per
	year. </td>
	</tr>
	{/if}
	<tr>
		<td colspan="2">
			<button style="width: 33%; margin: 0; margin-left: auto; margin-right: auto" on:click={resetParametersToDefaults}>Reset to default values</button>
		</td>
	</tr>
</tbody></table>
<p>
	We are interested in <b>comparative net worth</b>. Specifically, <i>is your net
	worth greater if you purchase rather than rent property?</i> And if so, <i>after
	how many years?</i>
</p>

<!-- Net worth comparison -->
{#if netWorth}
	{@const data = calculateNetWorth(netWorth)}
		{#if data.intersection == null}
		<p>
			Our model says that the net worth is never greater within the first
			{$maxYears} years if you buy.
		</p>
		{:else}
		<p>
			Our model says that your net worth is indeed greater if you buy, and that it
			is so after <u>{formatIntersection(data.intersection[0])}</u>:
		</p>
		{/if}
	<div>
		<h5 class="plotTitle">Comparative net worth over time</h5>
		<PlotContainer options={{
			style: plotStyle,
			color: { legend: true, style: { fontSize: "17px" }, },
			marginLeft: 60,
			marginTop: 10,
    		marginBottom: 50,
			grid: true,
			y: { tickFormat: "s", label: ""},
			x: { label: "Year", },
			marks: [
				Plot.line(
					data,
					{ x: "year", y: "amount", stroke: "model" }
				),
				...(
					data.intersection == null ? [] :
					[
						Plot.dot([data.intersection], {fill: "#7fc97f", "stroke": "#2ca02c", r: 5}),
						Plot.text([data.intersection], {text: d => formatIntersection(d[0]), dy: -15})
					]
				)
			]
		}} />
	</div>
{/if}

<p>
	To understand why, let's have a look at the annual change in comparative net worth.
	Here is a graph breaking down the contributions when you buy:
</p>

<!-- Change in net worth each year -->
{#if netWorth}
	{@const d = netWorthChartData(netWorth)}
	<div>
		<h5 class="plotTitle">Annual change in net worth when buying</h5>
		<NetWorthChart data={d.buyData} domainY={d.domainY} />
	</div>
	<p>
		The biggest positive contribution to net worth is usually growth of the house
		value. Deducations are dominated by purchase costs in the first year, and annual
		interest payments get smaller as the loan is paid off.
	</p>
	<p>
		The situation when renting is simpler. There are two main components: monthly
		rent and the growth of the initial capital invested in the stock market:
	</p>
	<div>
		<h5 class="plotTitle">Annual change in net worth when renting</h5>
		<NetWorthChart data={d.rentData} domainY={d.domainY} reversed={true} />
	</div>
	<p>
		The model also considers <i>spare cash</i>. If either buying or renting results
		in a smaller monthly cash outflow, <i>relative to the other scenario</i> you
		have spare cash to invest in the stock market.
	</p>
{/if}

{#if true}
<p>
	You can also <a target="_blank" on:click={downloadResultsAsCsv}>download the full
	set of results as a CSV file.</a>
</p>
{/if}

<h2>Which parameters have the biggest impact?</h2>
<p>
	We now ask how sensitive the model is to variations in the input values. The key
	outcome is <i>the number of years it takes for buying to be more financially
	advantageous than renting</i>, if that even occurs. A simple way to test the
	sensitivity of the model is to take each parameter in turn, modify it by plus or
	minus some proportion, and see how much the outcome changes.
</p>

<p>
	In the plot below we chose a set of parameters which made buying more
	attractive than renting after {formatIntersection(sensitivityBase)}, and then
	varied by plus or minus twenty percent.
</p>
<div>
	<h5 class="plotTitle">
		Effect on model outcome of changing input parameters
	</h5>
	<PlotContainer options={{
		style: plotStyle,
		color: { legend: true, range: ["#F98159", "#9DD554"], style: { fontSize: "17px" } },
		marginLeft: 170,
		marginBottom: 50,
		x: {
			label: "Years until net worth from buying exceeds that of renting",
		},
		y: { tickFormat: camelToWord, label: "", domain: sensitivityData.map(d => d.parameter) },
		marks: [
			Plot.ruleX([sensitivityBase], { stroke: "grey" }),
			Plot.barX(
				sensitivityData,
				{ x1: sensitivityBase, x: "value", y: "parameter", fill: "modification", insetTop: 6, insetBottom: 6, insetLeft: 2, insetRight: 2},
			),
			Plot.dot(
				sensitivityData,
				{ x: "value", y: "parameter", fill: "modification", r: 5},
			)
		],
		 }}
	/>
</div>

<p>
	For example: when a green bar (an increase of the parameter) goes to the left, it
	means that the increase caused buying to be <i>even more attractive</i> than
	renting.
</p>

<p>
	We can see that the most important parameters are the rate of growth of the property
	market, the amount of rent, and the rate of interest on Buy's loan.
</p>

<h2>Modelling assumptions</h2>
<p>
	TODO
</p>

<hr style="margin-top: 100px" />

<FootnoteTarget i="1">
	<!-- Rent -->
	The Genesis-Online system of DeStatis reports the number and total area of real
	estate for Berlin (table 31231-0003) for the end of 2021, from which we can derive
	an average living area of 73m². Statista reports an average monthly rent, which we
	presume is inclusive of heating costs, of 12.78 €/m².
</FootnoteTarget>

<FootnoteTarget i="2">
	<!-- Down Payment -->
	A <a href="https://www.interhyp.de/medien/ueber-interhyp/presse/baufinanzierung-in-deutschland-2020-interhyp-studie.pdf">
	study by InterHyp</a> in 2020 reports an average downpayment of 26% of the house value
	in 2020.
</FootnoteTarget>

<FootnoteTarget i="3">
	<!-- House price -->
	<a href="https://www.immowelt.de/immobilienpreise/berlin">ImmoWelt reports an
	average of 5,128 €/m² in Berlin</a>.
</FootnoteTarget>

<FootnoteTarget i="4">
	<!-- One-Off Cost -->
	The one-off cost consists of 7.14% broker commission (<i>Maklerprovision</i>),
	6% property transfer tax (<i>Grunderwerbssteuer</i>), 2% notary fees (<i>Notarkosten</i>),
	and 0.5% for the land registry entry (<i>Grundbucheintrag</i>).
</FootnoteTarget>

<FootnoteTarget i="5">
	<!-- Interest -->
	An <a href="https://www.test.de/Immobilienfinanzierung-Schritt-fuer-Schritt-zum-Kredit-5294522-5535292">
	article by <i>Stiftung Warentest</i></a> from November 2022 reports a
	fifteen-year fixed-rate interest of 3.89% for a loan of 80% of the house price.
</FootnoteTarget>

<FootnoteTarget i="6">
	<!-- Amortisation -->
	An <a href="https://www.test.de/Immobilienfinanzierung-Schritt-fuer-Schritt-zum-Kredit-5294522-5535292">
	article by <i>Stiftung Warentest</i></a> from November 2022 reports a typical
	amortisation rate of 2%.
</FootnoteTarget>

<FootnoteTarget i="7">
	<!-- Proportional Cost -->
	The <a href="https://de.wikipedia.org/wiki/Grundsteuer_(Deutschland)#Berechnung_(Wert_%C3%97_Grundsteuermesszahl_%C3%97_Hebesatz)">
	Wikipedia article on property tax in Germany</a> on contains details about the
	calculation. We combine this with <a href="https://www.lexoffice.de/wissenswelt/gewerbesteuerhebesatz/berlin/#hebesatz-bb">
	municipal tax values for Berlin</a> to arrive at a figure of 0.13%.
</FootnoteTarget>

<FootnoteTarget i="8">
	<!-- Fixed Costs -->
	The Berlin Senate Department for Urban Development and Housing published
	<a href="https://www.stadtentwicklung.berlin.de/wohnen/betriebskosten/de/tabelle.shtml">
	average utilities figures from 2017</a>, indicating a monthly sum of 2.29 €/m², if
	we exclude proprety tax. To this number we apply a rough inflation figure
	(table 61111-0004, variable CC13-04) of 22% from October 2017 to October 2022.
</FootnoteTarget>

<FootnoteTarget i="9">
	<!-- Stock Market Gain -->
	We take the S&P 500 to be representative of the stock market. This index saw a
	growth of 40% over the last five years, which is about 7% per year.
</FootnoteTarget>

<FootnoteTarget i="10">
	<!-- House Price Gain -->
	The Genesis-Online system of DeStatis reports the
	house price index (table 61262-0002) for Q2 2022 as 167.3 (Q2 2000 = 83.8). This is
	a 199% increase in 22 years, or around 3.2% per year. This is a pretty optimistic
	view from the perspective of 2022: a
	<a href="https://www.reuters.com/markets/europe/german-house-price-inflation-slow-borrowing-living-costs-bite-2022-05-26/">
		survey by Reuters</a> predicted 2% for 2024.
</FootnoteTarget>

<FootnoteTarget i="11">
	<!-- Rent Gain -->
	The Genesis-Online system of DeStatis reports the
	consumer price index (table 61111-0004) for rentals (variable CC13-0411) as 108.5 in
	June 2021 (June 2015 = 100). This is an 8.5% increase in six years, or around 1.4%
	per year. Technically this does not include heating costs, but we just ignore this
	and pretend it does.
</FootnoteTarget>

<FootnoteTarget i="12">
	<!-- Fixed Cost Gain -->
	The Genesis-Online system of DeStatis reports the
	consumer price index (table 61111-0004) for <i>maintenance and repair of the
	dwelling</i> (variable CC13-043) as 118.1 in July 2021 (July 2015 = 100.1). This is
	an 18.0% increase in six years, or 2.8% per year.
</FootnoteTarget>

<FootnoteTarget i="13">
	<!-- Capital Gains Tax -->
	Tax on capital gains in Germany is approximately
	26%. There is a tax-free allowance, but for simplicity we do not include this.
</FootnoteTarget>

<style>
	@font-face {
        font-family: 'Gelasio';
        font-style: normal;
        font-weight: 400;
        src: local('Gelasio Regular'), local('Gelasio-Regular'), url(https://fonts.gstatic.com/s/gelasio/v1/cIf9MaFfvUQxTTqS9C6hYQ.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

	.plotTitle{
		text-align: center;
		margin-bottom: 0;
	}

	/* all tables have a bit of padding */
	table { border-collapse: collapse }
	table > tr > td {
		padding-left: 5px;
		padding-right: 5px;
	}

	/* hide arrows on input */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
		text-align: right;
	}

	/* parameters table. First column is always 2/3rds width to prevent flickering when
	 * showing/hiding more parameters
	 */
	#parametersTable th:first-child,
	#parametersTable td:first-child {
		width: 66.67%;
	}
</style>
