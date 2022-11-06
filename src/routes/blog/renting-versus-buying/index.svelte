<script>
	import  * as d3 from 'd3';
	import * as Plot from '@observablehq/plot';
	import { parameterDefaults, simulate, netWorthChartData, constructCashTableData, camelToWord, calculateNetWorth, computeLoan } from './simulation';
	import PlotContainer from './PlotContainer.svelte';
	import NetWorthChart from './NetWorthChart.svelte';
	import FormattedNumberInput from "./FormattedNumberInput.svelte";

	// helper objects --------------------------------------------------------------- //
	const format = x => d3.format(',.2r')(Math.round(x / 10) * 10);
	const formatIntersection = d => `${Math.abs(d[0]) < 0.1 ? 0 : d[0].toFixed(1)} years`;
	const capitalise = string =>
		string ? (string.charAt(0).toUpperCase() + string.slice(1)) : string;
	const plotStyle = { fontFamily: "Gelasio", fontSize: "15px", overflow: true, background: "transparent" };

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
	let amortization = parameterDefaults.amortization;
	let fixedCost = parameterDefaults.fixedCost;
	let fixedCostGain = parameterDefaults.fixedCostGain;
	let proportionalCost = parameterDefaults.proportionalCost;

	// simulate --------------------------------------------------------------------- //
	let netWorth, cash;
	$: {
		[netWorth, cash] = simulate(
			amortization,
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
	}

	// results of sensitivity analysis
	const sensitivityBase = 8.718017178214817;
	const sensitivityData = [
	  {"parameter": "stockMarketGain", "modification": "Increase by 20%", "value": 7.6443199153483885},
	  {"parameter": "stockMarketGain", "modification": "Decrease by 20%", "value": 10.349869227763095},
	  {"parameter": "rent", "modification": "Increase by 20%", "value": 16.431609878339145},
	  {"parameter": "rent", "modification": "Decrease by 20%", "value": 4.932022458697653},
	  {"parameter": "rentGain", "modification": "Increase by 20%", "value": 9.035961716021573},
	  {"parameter": "rentGain", "modification": "Decrease by 20%", "value": 8.437096851276502},
	  {"parameter": "housePrice", "modification": "Increase by 20%", "value": 6.2556627157217575},
	  {"parameter": "housePrice", "modification": "Decrease by 20%", "value": 11.504965844448627},
	  {"parameter": "housePriceGain", "modification": "Increase by 20%", "value": 24.65521883522328},
	  {"parameter": "housePriceGain", "modification": "Decrease by 20%", "value": 5.025395666258443},
	  {"parameter": "downPayment", "modification": "Increase by 20%", "value": 9.906460606878042},
	  {"parameter": "downPayment", "modification": "Decrease by 20%", "value": 7.631987762635039},
	  {"parameter": "oneOffCost", "modification": "Increase by 20%", "value": 7.065110693929245},
	  {"parameter": "oneOffCost", "modification": "Decrease by 20%", "value": 10.335370055798478},
	  {"parameter": "interest", "modification": "Increase by 20%", "value": 5.784751891333453},
	  {"parameter": "interest", "modification": "Decrease by 20%", "value": 12.971362995486418},
	  {"parameter": "amortization", "modification": "Increase by 20%", "value": 8.083547902334809},
	  {"parameter": "amortization", "modification": "Decrease by 20%", "value": 9.337558364441904},
	  {"parameter": "fixedCost", "modification": "Increase by 20%", "value": 6.793252874084687},
	  {"parameter": "fixedCost", "modification": "Decrease by 20%", "value": 11.416614337430197},
	  {"parameter": "fixedCostGain", "modification": "Increase by 20%", "value": 8.493024914230151},
	  {"parameter": "fixedCostGain", "modification": "Decrease by 20%", "value": 8.979151913771023},
	  {"parameter": "proportionalCost", "modification": "Increase by 20%", "value": 6.896937613100356},
	  {"parameter": "proportionalCost", "modification": "Decrease by 20%", "value": 11.548767674084452},
	];


</script>

<header>
<span><a href="/">Back</a></span>
<h1>Renting versus buying</h1>
<p>November 2022</p>
<p style="color: grey">A simple numerical simulation of how the choice affects your net worth.</p>
</header>
<hr />
<p>
	To buy or to rent? On the face of it, it seems straightforward. Renting means
	transferring vast monthly sums to your landlord. If you buy, on the other hand, that
	same money flows into your very own house-shaped savings account for you to draw
	upon in your old age.
</p><p>
	There are, however, big financial downsides to buying. There is the one-off hit
	incurred when you purchase the house: things like property transfer tax and notarary
	fees. Then there are the regular interest payments which you funnel to the bank to
	finance your debt. There are also significant running costs: more taxes,
	maintenance... There's even a fee for the rain that falls on your lawn.
</p><p>
	Let's build a simple model to investigate the trade-off numerically. We start with
	two protagonists: <i>Buying Bob</i> and <i>Renting Rachel</i>. They both start with
	an identical starting capital of
	<FormattedNumberInput wide={true} bind:value={downPayment} /> cash in the bank.
</p>
<p>
	By the way, all of the parameters to this model are in text boxes. Feel free to edit
	them to match your own situation, or just out of curiosity to see what happens to
	the results!
</p>
<h2>Renting Rachel</h2>
<p>
	Rachel takes her starting capital and invests it in the stock market. She pays
	<FormattedNumberInput bind:value="{rent}" /> per month in rent,
	inclusive of all utilities and heating costs.
</p>
<h2>Buying Bob</h2>
<p>
	Bob uses his starting capital as a downpayment to purchase a house valued at
	<FormattedNumberInput bind:value="{housePrice}" wide={true} />. The purchase
	incurs a one-off cost of
	<FormattedNumberInput bind:value="{oneOffCost}" wide={true} />
	(or {d3.format(".0%")(oneOffCost / housePrice)} of the house price) in property
	transfer tax, notary fees, etc. He takes out a loan of
	{format(computeLoan(housePrice, oneOffCost, downPayment))} to fund his purchase.
</p>
<p>Bob's regular outgoings break down as follows:</p>
<table><tbody>
	<tr>
		<td>Interest on the loan</td>
		<td><input type="number" style="text-align: right; width: 4em" bind:value="{interest}" />% per year</td>
	</tr>
	<tr>
		<td>Amortization of the loan</td>
		<td><input type="number" style="text-align: right; width: 4em" bind:value="{amortization}" />% per year</td>
	</tr>
	<tr>
		<td>Costs proportional to the house value such as property tax</td>
		<td>
			<input type="number" style="text-align: right; width: 4em" bind:value="{proportionalCost}" />% of the
			value of the house per year
		</td>
	</tr>
	<tr>
		<td>Fixed costs such as utilities and maintenance</td>
		<td>
			<FormattedNumberInput bind:value="{fixedCost}" /> per
			month, or {d3.format(".1%")(12 * fixedCost / housePrice)} of the value of
			the house per year
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
		<td><input type="number" style="text-align: right; width: 4em" bind:value="{stockMarketGain}" />% per year<a href="#footnote1"><sup>1</sup></a></td>

	</tr>
	<tr>
		<td>House price growth</td>
		<td><input type="number" style="text-align: right; width: 4em" bind:value={housePriceGain} />% per year<a href="#footnote2"><sup>2</sup></a></td>
	</tr>
	<tr>
		<td>Rent inflation</td>
		<td><input type="number" style="text-align: right; width: 4em" bind:value="{rentGain}" />% per year<a href="#footnote3"><sup>3</sup></a></td>
	</tr>
	<tr>
		<td>Inflation of Bob's fixed costs</td>
		<td><input type="number" style="text-align: right; width: 4em" bind:value="{fixedCostGain}" />% per year<a href="#footnote4"><sup>4</sup></a></td>
	</tr>
</tbody></table>

<p>
	We tax capital gains on the stock market at
	<input type="number" style="text-align: right; width: 4em" bind:value="{capitalGainsTax}" />% per year.<a href="#footnote5"><sup>5</sup></a> House price
	growth is not taxed (annual property tax is included in the proportional costs of
	the previous section).
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
	Depending on what parameters you put into the model, it's likely that you see a
	difference. Typically, Rachel has smaller cash outgoings. If we are to assume that
	Bob and Rachel have a comparable income, this means that she has more spare cash
	lying around than Bob. That's advantageous to her because she's able to invest it in
	the stock market and cream off a return. Let's assume that's exactly what she does.
</p>
<h2>Results: what is the effect on net worth?</h2>
<p>
	Now that we've built our model, let's see what pops out. What we are really
	interested in is not cash per se, but rather <b>net worth</b>. Specifically, we would like
	to know: <i>is your net worth greater if you purchase a house than if you rent
	one?</i> And if so, <i>after how many years?</i>
</p>

<!-- Net worth comparison -->
{#if netWorth}
	{@const data = calculateNetWorth(netWorth)}
		{#if data.intersection == null}
		<p>
			Our model says that the net worth is never greater with in the first
			{maxYears} years.
		</p>
		{:else}
		<p>
			Our model says that your net worth is indeed greater and that it is so
			after {formatIntersection(data.intersection)}:
		</p>
		{/if}
	<div>
		<h5 class="plotTitle">Net worth over time</h5>
		<PlotContainer options={{
			style: plotStyle,
			color: { legend: true },
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
						Plot.text([data.intersection], {text: formatIntersection, dy: -15})
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
	Note that we don't include amortisation in the net worth figures, since this is a
	straight transfer of a cash asset into a property asset.
</p>

<!-- Change in net worth each year -->
{#if netWorth}
	{@const d = netWorthChartData(netWorth)}
	<div>
		<h5 class="plotTitle">Breakdown of annual change in net worth for Bob</h5>
		<NetWorthChart data={d.bobData} domainY={d.domainY} />
	</div>

	<p>
		Rachel's situation is simpler. In the beginning her net worth, or rather her net
		worth <i>relative to Bob</i>, simply decreases due to rent. However, over time she
		starts receiving handsome yields from her extra spare income relative to Bob.
	</p>

	<div>
		<h5 class="plotTitle">Breakdown of annual change in net worth for Rachel</h5>
		<NetWorthChart data={d.rachelData} domainY={d.domainY} reversed={true} />
	</div>
{/if}

<h2>Which parameters have the biggest impact?</h2>
<p>
	We now ask how sensitive the model is to variations in the input values. The key
	outcome is <i>the number of years it takes for buying to be more financially
	advantageous than renting</i>, if that even occurs. A simple way to test the
	sensitivity of the model is to take each parameter in turn. modify it by plus or
	minus ten percent, and see how much the outcome changes.
</p>

<div>
	<h5 class="plotTitle">
		Effect on model outcome of changing input parameters
	</h5>
	<PlotContainer options={{
		style: plotStyle,
		color: { legend: true, range: ["#F98159", "#9DD554"] },
		marginLeft: 140,
		marginBottom: 50,
		x: {
			label: "Years until net worth from buying exceeds that of renting",
		},
		y: { tickFormat: camelToWord, label: "" },
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

<hr style="margin-top: 100px" />

<p class="footnote">
	<!-- Stock Market Gain -->
	<a id="footnote1"><sup>1</sup></a> We take the S&P 500 to be representative of the
	stock market. This index saw a growth of 40% over the last five years, which is
	about 7% per year.
</p>

<p class="footnote">
	<!-- House Price Gain -->
	<a id="footnote2"><sup>2</sup></a> The German house price index in August 2022 was
	223 (2005=100). This is a 123% increase in 17.7 years, or around 4.6% per year.
</p>

<p class="footnote">
	<!-- rent gain -->
	<a id="footnote3"><sup>3</sup></a> The Genesis-Online system of DeStatis reports the
	consumer price index for CC13-041 (rentals) was 108.4 in 2021 (2015=100). This is an
	8.4% increase in six years, or around 1.4% per year. Technically this does not
	include heating costs, but we just ignore this and pretend it does.
</p>

<p class="footnote">
	<!-- Fixed Cost Gain -->
	<a id="footnote4"><sup>4</sup></a> The Genesis-Online system of DeStatis reports the
	consumer price index for CC13-044 (maintenance and repair of the dwelling) as 117.4
	in 2021 (2015=100). This is a 17.4% increase in six years, or around 2.7% per year.
</p>

<p class="footnote">
	<!-- Capital Gains Tax -->
	<a id="footnote5"><sup>5</sup></a> Tax on capital gains in Germany is approximately 26%. There is a tax-free allowance,
	but for simplicity we do not include this.
</p>

<p class="footnote">
	<!-- Down Payment -->
</p>

<p class="footnote">
	<!-- One-Off Cost -->
</p>

<p class="footnote">
	<!-- Interest -->
</p>

<p class="footnote">
	<!-- Amortization -->
</p>

<p class="footnote">
	<!-- Fixed Cost -->
</p>

<p class="footnote">
	<!-- Proportional Cost -->
</p>

<style>
	@font-face {
        font-family: 'Gelasio';
        font-style: normal;
        font-weight: 400;
        src: local('Gelasio Regular'), local('Gelasio-Regular'), url(https://fonts.gstatic.com/s/gelasio/v1/cIf9MaFfvUQxTTqS9C6hYQ.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

	.footnote {
		font-size: smaller
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

	.pink {
		background-color: GhostWhite;
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
