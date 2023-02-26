<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js" integrity="sha512-csNcFYJniKjJxRWRV1R7fvnXrycHP6qDR21mgz1ZP55xY5d+aHLfo9/FcGDQLfn2IfngbAHd8LdfsagcCqgTcQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js" integrity="sha512-SGWgwwRA8xZgEoKiex3UubkSkV1zSE1BS6O4pXcaxcNtUlQsOmOmhVnDwIvqGRfEmuz83tIGL13cXMZn6upPyg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</svelte:head>

<script>
	import  * as d3 from 'd3';
	import * as Plot from '@observablehq/plot';
	import { parameterDefaults, simulate, netWorthChartData, constructCashTableData, camelToWord, calculateNetWorth, computeLoan, pivotData } from './simulation';
	import PlotContainer from './PlotContainer.svelte';
	import NetWorthChart from './NetWorthChart.svelte';
	import FormattedNumberInput from "./FormattedNumberInput.svelte";
	import FootnoteTarget from "./FootnoteTarget.svelte";
	import FootnoteSource from "./FootnoteSource.svelte";

	// helper objects --------------------------------------------------------------- //
	const format = x => d3.format(',.2r')(Math.round(x / 10) * 10);
	const formatIntersection = d => `${Math.abs(d) < 0.1 ? 0 : d.toFixed(1)} years`;
	const capitalise = string =>
		string ? (string.charAt(0).toUpperCase() + string.slice(1)) : string;
	const plotStyle = { fontFamily: "Gelasio", fontSize: "18px", overflow: true, background: "transparent" };

	// model parameters ------------------------------------------------------------- //
	let maxYears = parameterDefaults.maxYears;
	let stockMarketGain = parameterDefaults.stockMarketGain;
	let capitalGainsTax = parameterDefaults.capitalGainsTax;
	let rent = parameterDefaults.rent;
	let rentGain = parameterDefaults.rentGain;
	let housePrice = parameterDefaults.housePrice;
	let housePriceGain = parameterDefaults.housePriceGain;
	let downPayment = parameterDefaults.downPayment;
	let oneOffCost = parameterDefaults.oneOffCost;
	let interest = parameterDefaults.interest;
	let amortisation = parameterDefaults.amortisation;
	let fixedCost = parameterDefaults.fixedCost;
	let fixedCostGain = parameterDefaults.fixedCostGain;
	let proportionalCost = parameterDefaults.proportionalCost;

	// simulate --------------------------------------------------------------------- //
	let data, netWorth, cash;
	$: {
		data = simulate(
			amortisation,
			capitalGainsTax,
			downPayment,
			fixedCostGain,
			fixedCost,
			housePrice,
			housePriceGain,
			interest,
			maxYears,
			oneOffCost,
			proportionalCost,
			rent,
			rentGain,
			stockMarketGain
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
		const dataString = Papa.unparse(pivotData(data));
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
	To buy or to rent? On the face of it it seems straightforward. If you rent, you
	fritter away eye-watering monthly sums to your landlord. If you buy, on the other
	hand, that same hard-earned money flows into your very own house-shaped savings
	account for you to draw upon in your old age.
</p><p>
	In reality there are also big financial downsides to buying property that might not
	be immediately obvious. There is the one-off hit incurred when you make the
	purchase: things like property transfer tax and notarary fees. Then there are the
	regular interest payments which you funnel to the bank to finance your debt. There
	are also significant running costs: more taxes, maintenance... there can even be a
	fee for the rain that falls on your lawn.
</p><p>
	Let's build a simple model to investigate the trade-off numerically. We start with
	two protagonists: <i>Buying Bob</i> and <i>Renting Rachel</i>. They both start with
	an identical starting capital of
	<FormattedNumberInput wide={true} bind:value={downPayment} /> cash in the bank.
</p>
<p>
	(By the way, all of the parameters to this model are in text boxes. Feel free to edit
	them to match your own situation, or just out of curiosity to see what happens!)
</p>
<h2>Renting Rachel</h2>
<p>
	Rachel takes her starting capital and invests it in the stock market. She pays
	<FormattedNumberInput bind:value="{rent}" /> per month in
	rent,<FootnoteSource i="1" /> inclusive of all utilities and heating costs.
</p>
<h2>Buying Bob</h2>
<p>
	Bob uses his starting capital as a downpayment<FootnoteSource i="2" /> to purchase a
	house valued at
	<FormattedNumberInput bind:value="{housePrice}" wide={true} />.<FootnoteSource i="3" />
	The purchase incurs a one-off cost of
	<FormattedNumberInput bind:value="{oneOffCost}" wide={true} /> (or
	{d3.format(".0%")(oneOffCost / housePrice)} of the house
	price)<FootnoteSource i="4" /> in property transfer tax, notary fees, and so on. He
	takes out a loan of {format(computeLoan(housePrice, oneOffCost, downPayment))} to
	fund his purchase.
</p>
<p>Bob's regular outgoings break down as follows:</p>
<table><tbody>
	<tr>
		<td>Interest on the loan</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{interest}" />%
			per year<FootnoteSource i="5" />
		</td>
	</tr>
	<tr>
		<td>Amortisation of the loan</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{amortisation}" />%
			per year<FootnoteSource i="6" />
		</td>
	</tr>
	<tr>
		<td>Costs proportional to the house value such as property tax</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{proportionalCost}" />% of the
			value of the house per year<FootnoteSource i="7" />
		</td>
	</tr>
	<tr>
		<td>Fixed costs such as utilities and maintenance</td>
		<td>
			<FormattedNumberInput bind:value="{fixedCost}" /> per
			month, or {d3.format(".1%")(12 * fixedCost / housePrice)} of the value of
			the house per year<FootnoteSource i="8" />
		</td>
	</tr>
</tbody></table>
<h2>Inflation and growth</h2>
<p>
	Over time, prices in the market will fluctuate. There are four that we suppose are
	important for our model:
</p>
<table><tbody>
	<tr>
		<td>Stock market growth</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{stockMarketGain}" />% per
			year<FootnoteSource i="9" />
		</td>

	</tr>
	<tr>
		<td>House price growth</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value={housePriceGain} />% per
			year<FootnoteSource i="10" />
		</td>
	</tr>
	<tr>
		<td>Rent inflation</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{rentGain}" />% per
			year<FootnoteSource i="11" />
		</td>
	</tr>
	<tr>
		<td>Inflation of Bob's fixed costs</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{fixedCostGain}" />% per
			year<FootnoteSource i="12" />
		</td>
	</tr>
</tbody></table>

<p>
	We tax capital gains on the stock market at
	<input type="number" style="text-align: right; width: 4em" bind:value="{capitalGainsTax}" />% per
	year.<FootnoteSource i="13" /> House price growth is not taxed (annual property tax
	is included in Bob's proportional costs).
</p>

<h2>What about income?</h2>
<p>
	There's one more difference between Bob and Rachel that we'll need to account for.
	To understand this, let's look at Bob and Rachel's pure cash outgoings during an
	<i>average month</i> in the the first year. For ease of reading, all numbers are
	displayed to two significant figures:
</p>
<table>
	<thead>
		<tr>
			<th colspan="2">
				Bob
			</th>
			<th colspan="2">
				Rachel
			</th>
		</tr>
	</thead>

	{#if cash}
		{@const tableData = constructCashTableData(cash)}
		<tbody>
		{#each tableData as row}
		<tr>
			<td>{#if row[0]}{capitalise(row[0].category)}{/if}</td>
			<td style="text-align: right">{#if row[0]}{format(-row[0].amount)}{/if}</td>
			<td>{#if row[1]}{capitalise(row[1].category)}{/if}</td>
			<td style="text-align: right">{#if row[1]}{format(-row[1].amount)}{/if}</td>
		</tr>
		{/each}
		</tbody>
		<tfoot>
			<tr>
				<td>Total</td>
				<td style="text-align: right">
					{format(-tableData.totals[0])}
				</td>
				<td>Total</td>
				<td style="text-align: right">
					{format(-tableData.totals[1])}
				</td>
			</tr>
		</tfoot>
	{/if}
</table>

<p>
	Depending on what parameters you put into the model it's likely that you see a
	difference. Typically, Rachel has smaller cash outgoings. If we are to assume that
	Bob and Rachel have an equal income, this means that she has more spare cash lying
	around than Bob. That's advantageous to her because she's able to invest it in the
	stock market and cream off a return. Let's assume that's exactly what she does.
</p>
<h2>Results</h2>
<p>
	Now that we've built our model, let's see what pops out. What we are really
	interested in is not cash per se, but rather <b>net worth</b>. Specifically, we
	would like to know: <i>is your net worth greater if you purchase a house than if you
	rent one?</i> And if so, <i>after how many years?</i>
</p>

<!-- Net worth comparison -->
{#if netWorth}
	{@const data = calculateNetWorth(netWorth)}
		{#if data.intersection == null}
		<p>
			Our model says that the net worth is never greater within the first
			{maxYears} years.
		</p>
		{:else}
		<p>
			Our model says that your net worth is indeed greater and that it is so
			after <u>{formatIntersection(data.intersection[0])}</u>:
		</p>
		{/if}
	<div>
		<h5 class="plotTitle">Net worth over time</h5>
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
	To understand why, let's have a look at the contributions to the change in net worth
	each year. Typically, Bob's biggest contributor to net worth is growth of the house
	value. We've modelled this as a percentage, so eventually the magic of compound
	interest dominates. Deductions from his net worth initially consist of the cost of
	purchasing the house, but come to be dominated by porportional costs such as
	property tax. His yearly interest payments also get smaller as the loan is paid off.
	(Note that we don't include amortisation in the net worth figures, since this is a
	straight transfer of a cash asset into a property asset).
</p>

<!-- Change in net worth each year -->
{#if netWorth}
	{@const d = netWorthChartData(netWorth)}
	<div>
		<h5 class="plotTitle">Annual change in net worth for Bob</h5>
		<NetWorthChart data={d.bobData} domainY={d.domainY} />
	</div>

	<p>
		Rachel's situation is simpler. Her net worth, or rathar her net worh
		<i>relative to Bob</i>, is bouyed by her wily investmnets in the stock market,
		while her monthly rent payment drags it down.
	</p>

	<div>
		<h5 class="plotTitle">Annual change in net worth for Rachel</h5>
		<NetWorthChart data={d.rachelData} domainY={d.domainY} reversed={true} />
	</div>
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
	market, the amount of rent, and the rate of interest on Bob's loan.
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

</style>
