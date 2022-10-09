<script>
	import  * as d3 from 'd3';
	import * as Plot from '@observablehq/plot';
	import { parameterDefaults, simulate, netWorthChartData, constructCashTableData, calculateNetWorth, computeLoan } from './simulation';
	import PlotContainer from './PlotContainer.svelte';
	import FormattedNumberInput from "./FormattedNumberInput.svelte";

	// helper objects --------------------------------------------------------------- //
	const format = x => d3.format(',.2r')(Math.round(x / 10) * 10);
	const formatIntersection = d => `${Math.abs(d[0]) < 0.1 ? 0 : d[0].toFixed(1)} years`;
	const capitalise = string =>
		string ? (string.charAt(0).toUpperCase() + string.slice(1)) : string;
	const plotStyle = { fontFamily: "Gelasio", fontSize: "15px", overflow: true };
	const legendStyle = { fontFamily: "Gelasio", fontSize: "13px", overflow: true };

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


</script>

<div id="content">
<span><a href="/">Back</a></span>
<h1>Renting versus buying</h1>
<p style="color: grey">A simple numerical simulation of how the choice affects your net worth.</p>
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
	<FormattedNumberInput bind:value="{housePrice}" wide={true}  />. The purchase
	incurs a one-off cost of
	<FormattedNumberInput bind:value="{oneOffCost}" wide={true} />
	(or {d3.format(".0%")(oneOffCost / housePrice)} of the house price) in property
	transfer tax, notary fees, etc. He takes out a loan of
	{format(computeLoan(housePrice, oneOffCost, downPayment))} to fund his purchase.
</p>
<p>Bob's regular outgoings break down as follows:</p>
<table class="half-table">
	<tr>
		<td>Interest on the loan</td>
		<td><input type="number" style="text-align: right; width: 3em" bind:value="{interest}" />% per year</td>
	</tr>
	<tr>
		<td>Amortization of the loan</td>
		<td><input type="number" style="text-align: right; width: 3em" bind:value="{amortization}" />% per year</td>
	</tr>
	<tr>
		<td>Costs proportional to the house value such as property tax</td>
		<td>
			<input type="number" style="text-align: right; width: 3em" bind:value="{proportionalCost}" />% of the
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
</table>
<h2>Inflation and growth</h2>
<p>
	Over time, prices in the market will fluctuate. There are four that we suppose are
	important for our model:
</p>
<table class="half-table">
	<tr>
		<td>Stock market growth</td>
		<td>
			<input type="number" style="text-align: right; width: 3em" bind:value="{stockMarketGain}" />% per year.
		</td>
	</tr>
	<tr>
		<td>House price growth</td>
		<td><input type="number" style="text-align: right; width: 3em" bind:value={housePriceGain} />% per year</td>
	</tr>
	<tr>
		<td>Rent inflation</td>
		<td><input type="number" style="text-align: right; width: 3em" bind:value="{rentGain}" />% per year</td>
	</tr>
	<tr>
		<td>Inflation of Bob's fixed costs</td>
		<td><input type="number" style="text-align: right; width: 3em" bind:value="{fixedCostGain}" />% per year</td>
	</tr>
</table>

<p>
	We tax capital gains on the stock market at
	<input type="number" style="text-align: right; width: 3em" bind:value="{capitalGainsTax}" />% per year. House price
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
<table style="margin-left: auto; margin-right: auto">
	<tr>
		<th colspan="2" style="border: 1px solid black" class="pink">
			Bob
		</th>
		<th colspan="2" style="border: 1px solid black; border-left: 1px solid black" class="pink">
			Rachel
		</th>
	</tr>
	{#if cash}
		{@const tableData = constructCashTableData(cash)}
		{#each tableData as row}
		<tr>
			<td style="border-left: 1px solid black">{#if row[0]}{capitalise(row[0].category)}{/if}</td>
			<td style="text-align: right">{#if row[0]}{format(-row[0].amount)}{/if}</td>
			<td style="border-left: 1px solid black">{#if row[1]}{capitalise(row[1].category)}{/if}</td>
			<td style="border-right: 1px solid black; text-align: right">{#if row[1]}{format(-row[1].amount)}{/if}</td>
		</tr>
		{/each}
		<tr class="pink">
			<td style="border: 1px solid black; border-right: 0px"></td>
			<td style="font-weight: bold; border: 1px solid black; border-left: 0px; text-align: right">
				{format(-tableData.totals[0])}
			</td>
			<td style="border: 1px solid black; border-right: 0px"></td>
			<td style="font-weight: bold; border: 1px solid black; border-left: 0px; text-align: right">
				{format(-tableData.totals[1])}
			</td>
		</tr>
	{/if}
</table>

<p>
	Depending on what parameters you put into the model, it's likely that you see a
	difference. Typically, Rachel has smaller cash outgoings. If we are to assume that
	Bob and Rachel have a comparable income, this means that she has more spare cash
	lying around than Bob. That's advantageous to her because she's able to invest it in
	the stock market and cream off a return. Let's assume that's exactly what she does.
</p>
<h2>Results</h2>
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
<p>
	Rachel's situation is simpler. In the beginning her net worth, or rather her net
	worth <i>relative to Bob</i>, simply decreases due to rent. However, over time she
	starts receiving handsome yields from her extra spare income relative to Bob.
</p>

<!-- Change in net worth each year -->
{#if netWorth}
	{@const d = netWorthChartData(netWorth)}
	{#each d.data as [model, data]}
	<div>
		<h5 class="plotTitle">Breakdown of annual change in net worth for {capitalise(model)}</h5>
		<PlotContainer options={{
			color: {
				type: "categorical",
				legend: true,
				range: model === "rachel" ? d3.schemeCategory10
				.slice().reverse() : d3.schemeCategory10

			},
			style: plotStyle,
			marginLeft: 60,
			marginTop: 10,
    		marginBottom: 50,
			x: {
				label: "Year",
				// Here we hide the tick every other year. The "ticks" option seems to
				// be ignored for bar plots :/
				tickFormat: y => y % 2 ? "" : y
			},
			y: { tickFormat: "s", domain: d.domainY },
			marks: [
				Plot.barY(
					data,
					{ x: "year", y: "amount", fill: "category"}
				),
				Plot.ruleY([0], { stroke: "grey" }),
			],
			 }}
		/>
	</div>
	{/each}
{/if}

<h2>How sensitive is the model to its inputs?</h2>
<p>
	The first question we might ask is how sensitive the model is to variations in the
	input values. The key outcome is the number of years it takes for buying to be more
	financially advantageous than renting. A simple way to test the sensitivity of the
	model is to take each parameter in turn and modify it by plus or minus ten percent,
	and see how much the outcome changes.
</p>

<h2>Is this model realistic?</h2>
<p>
	We now ask two questions. Firstly, is this above model realistic? And secondly, are
	the parameter values realistic?
</p>
<p>
	Let's start with the parameters
</p>

</div>

<style>
	@font-face {
        font-family: 'Gelasio';
        font-style: normal;
        font-weight: 400;
        src: local('Gelasio Regular'), local('Gelasio-Regular'), url(https://fonts.gstatic.com/s/gelasio/v1/cIf9MaFfvUQxTTqS9C6hYQ.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }

	#content {
		line-height: 1.7;
		font-family: Gelasio, Georgia, serif;

		/* centered */
		max-width: 560px;
		margin-left: auto;
		margin-right: auto;
	}

	.plotTitle{
		text-align: center;
		margin-bottom: 0px;
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

	/* two-column table where each table is half the width of the page */
	.half-table { width: 100%; border: 1px solid gainsboro; }
	.half-table > tr > th { border: 1px solid gainsboro; }
	.half-table > tr > td {
		border: 1px solid gainsboro;
		width: 50%;
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
