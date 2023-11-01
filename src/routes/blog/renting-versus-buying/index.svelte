<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js" integrity="sha512-csNcFYJniKjJxRWRV1R7fvnXrycHP6qDR21mgz1ZP55xY5d+aHLfo9/FcGDQLfn2IfngbAHd8LdfsagcCqgTcQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js" integrity="sha512-SGWgwwRA8xZgEoKiex3UubkSkV1zSE1BS6O4pXcaxcNtUlQsOmOmhVnDwIvqGRfEmuz83tIGL13cXMZn6upPyg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</svelte:head>

<!--TODO:-->
<!-- - Generally review all parameters & default values and update footnotes -->
<!-- - Sensitive analysis: add infinity (?), better handle base case is null -->
<!-- - Add hover for graphs -->
<!-- - Three options: Germany, UK, Berlin? -->
<!-- - Add default for UK? -->
<!-- - Arrows on senstivity analysis ("buying more attractive; renting more attractive") -->
<!-- - Skip sensitivity analysis when no intersection -->
<!-- - Only run sensitivy analysis up until first intersection -->
<!-- - Store FileSaver and papaparse in this repository rather than fetching from cdnjs -->
<!-- - Add monte-carlo simulation?-->
<!-- - Add mathematical analysis-->
<!-- - Preview of results before download? -->
<!-- - Consistent legend colours in net worth graphs -->
<!-- - Add income to graphs to prevent them going down? -->

<script>
	import * as Plot from '@observablehq/plot';
	import FootnoteSource from "./FootnoteSource.svelte";
	import FootnoteTarget from "./FootnoteTarget.svelte";
	import NetWorthChart from './NetWorthChart.svelte';
	import PlotContainer from '../../../lib/PlotContainer.svelte';
	import { resetParametersToDefaults, localStorageStore } from './parameters.js';
	import { simulate, netWorthChartData, camelToWord, calculateNetWorth, prepareDataForCsvDownload } from './simulation';
	import { sensitivityAnalysis } from './sensitivityAnalysis';

	// helper objects --------------------------------------------------------------- //
	const formatLocale = x => x.toLocaleString();
	const formatIntersection = d => `${Math.abs(d) < 0.1 ? 0 : d.toFixed(1)} years`;
	const plotStyle = { fontFamily: "Gelasio", fontSize: "18px", overflow: true, background: "transparent" };
	let showingMoreParameters = false;

	// model parameters ------------------------------------------------------------- //
	const _area = 100;
	const _rentPerM2 = 12.78;
	const _housePricePerM2 = 5_128;
	const _housePrice = _housePricePerM2 * _area;
	const twoSF = x => parseFloat(x.toPrecision(2));
	const threeSF = x => parseFloat(x.toPrecision(3));

	const capitalGainsTax = localStorageStore("capitalGainsTax", 26);  // percentage per year
	const heatingGain = localStorageStore("heatingGain", 4.8);  // percentage per year
	const houseAmortisationRate = localStorageStore("houseAmortisationRate", 1.5);  // percentage per year
	const housePricePerM2 = localStorageStore("housePricePerM2", twoSF(_housePricePerM2));  // euros per m2
	const houseHeatingCost = localStorageStore("houseHeatingCost", threeSF(0.1226 * 125 / 12));  // euros per m2 per month
	const houseInterestRate = localStorageStore("houseInterestRate", 3.89);  // percentage per year
	const houseMaintenanceCost = localStorageStore("houseMaintenanceCost", 1.12);  // euros per m2 per month
	const houseOtherCost = localStorageStore("houseOtherCost", 1.74);  // euros per m2
	const housePrice = localStorageStore("housePrice", twoSF(_housePrice));  // euros
	const housePriceGain = localStorageStore("housePriceGain", 2);  // percentage per year
	const housePurchaseCost = localStorageStore("housePurchaseCost", 12.07);  // percentage
	const houseTax = localStorageStore("houseTax", 0.1);  // percentage
	const maintenanceGain = localStorageStore("maintenanceGain", 2.8);  // percentage per year
	const maxYears = localStorageStore("maxYears", 30);
	const otherCostGain = localStorageStore("otherCostGain", 2);  // percentage per year
	const rent = localStorageStore("rent", twoSF(_rentPerM2 * _area));  // euros per month
	const rentGain = localStorageStore("rentGain", 2);  // percentage per year
	const rentPerM2 = localStorageStore("rentPerM2", _rentPerM2);  // euros per m2 per month
	const startingCapital = localStorageStore("startingCapital", twoSF(0.26 * _housePrice));  // euros
	const stockMarketGain = localStorageStore("stockMarketGain", 7);  // percentage per year

	// simulate --------------------------------------------------------------------- //
	let data, netWorth, cash;
	$: {
		data = simulate(
    			$capitalGainsTax,
    			$heatingGain,
    			$houseAmortisationRate,
    			$houseHeatingCost * $housePrice / $housePricePerM2,
    			$houseInterestRate,
    			$houseMaintenanceCost * $housePrice / $housePricePerM2,
    			$houseOtherCost * $housePrice / $housePricePerM2,
    			$housePrice,
    			$housePriceGain,
    			$housePurchaseCost,
    			$houseTax,
    			$maintenanceGain,
    			$maxYears,
    			$otherCostGain,
    			$rent,
    			$rentGain,
    			$houseHeatingCost * $rent / $rentPerM2,
    			$houseMaintenanceCost * $rent / $rentPerM2,
    			$houseOtherCost * $rent / $rentPerM2,
    			$startingCapital,
    			$stockMarketGain,
		);
		cash = data.filter(r => r.cashExpenditure)
		netWorth = data.filter(r => r.netWorthContributor)
	}

	function downloadResultsAsCsv() {
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
<article>
	<table id="parametersTable"><tbody>
		<tr>
			<td>Starting capital<FootnoteSource i="1" /><br /></td>
			<td><input type="number" bind:value={$startingCapital} /></td>
			<td>€</td>
		</tr>
		<tr>
			<td>
				Cold rent<!--<FootnoteSource i="2" />-->
				<br /><small>Excluding utilities and other costs</small>
			</td>
			<td><input type="number" bind:value="{$rent}" /></td>
			<td>€ / month</td>
		</tr>
		<tr>
			<td>Cold rent inflation<FootnoteSource i="2" /></td>
			<td><input type="number" bind:value="{$rentGain}" /></td>
			<td>% / year</td>
		</tr>
		<tr>
			<td>House price<!--<FootnoteSource i="4" />--></td>
			<td><input type="number"  bind:value="{$housePrice}" /></td>
			<td>€</td>
		</tr>
		<tr>
			<td>House price growth<FootnoteSource i="3" /></td>
			<td><input type="number" bind:value={$housePriceGain} /></td>
			<td>% / year</td>
		</tr>
		<tr>
			<td>Stock market growth<FootnoteSource i="4" /></td>
			<td><input type="number" bind:value="{$stockMarketGain}" /></td>
			<td>% / year</td>
		</tr>
		<tr>
			<td>Interest on the loan<FootnoteSource i="5" /></td>
			<td><input type="number" bind:value="{$houseInterestRate}" /></td>
			<td>% / year</td>
		</tr>
		<tr>
			<td colspan="3" style="text-align: center">
				<a on:click={() => (showingMoreParameters = !showingMoreParameters)}>
					<small>Show {showingMoreParameters ? 'fewer' : 'more'} parameters</small>
				</a>
			</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Years to simulate</td>
			<td><input type="number" bind:value="{$maxYears}" min="0" max="100" /></td>
			<td></td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>
				Purchase cost<FootnoteSource i="6" /><br />
				<small>Property transfer tax, notary fees, and so on</small>
			</td>
			<td><input type="number" bind:value="{$housePurchaseCost}" /></td>
			<td>%</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Cold rent per area<!--<FootnoteSource i="10" />--></td>
			<td><input type="number" bind:value={$rentPerM2} /></td>
			<td>€ / m&sup2 / month</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>House price per area<!--<FootnoteSource i="11" />--></td>
			<td><input type="number" bind:value={$housePricePerM2} /></td>
			<td>€ / m&sup2</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Amortisation of the loan<FootnoteSource i="7" /></td>
			<td><input type="number" bind:value="{$houseAmortisationRate}" /></td>
			<td>% / year </td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Property tax<FootnoteSource i="8" /></td>
			<td><input type="number" bind:value="{$houseTax}" /></td>
			<td>% / year</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Heating costs<FootnoteSource i="9" /></td>
			<td><input type="number" bind:value="{$houseHeatingCost}" /></td>
			<td>€ / m&sup2 / month</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Inflation of heating costs<FootnoteSource i="10" /></td>
			<!-- TODO: apply to rental and house? -->
			<td><input type="number" bind:value="{$heatingGain}" /></td>
			<td>% / year </td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Maintenance costs<FootnoteSource i="11" /></td>
			<!-- TODO: apply to rental and house? -->
			<td><input type="number" bind:value="{$houseMaintenanceCost}" /></td>
			<td>€ / m&sup2 / month</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Inflation of maintenance costs<FootnoteSource i="12" /></td>
			<!-- TODO: apply to rental and house? -->
			<td><input type="number" bind:value="{$maintenanceGain}" /></td>
			<td>% / year</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>
				Other housing/rental costs<FootnoteSource i="13" /><br />
				<small>Rubbish collection, stormwater fee, etc.</small>
			</td>
			<td><input type="number" bind:value="{$houseOtherCost}" /></td>
			<td>€ / m&sup2 / month</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Inflation of other housing/rental costs<!--<FootnoteSource i="19" />--></td>
			<td><input type="number" bind:value="{$otherCostGain}" /></td>
			<td>% / year</td>
		</tr>
		<tr class="{showingMoreParameters ? '' : 'collapsed'}">
			<td>Capital gains tax<FootnoteSource i="14" /></td>
			<td><input type="number" bind:value="{$capitalGainsTax}" /></td>
			<td>% / year</td>
		</tr>
		<tr>
	</tbody></table>
	<button style="width: 33%; margin: 0; margin-left: auto; margin-right: auto" on:click={resetParametersToDefaults}>Reset to default values</button>
</article>
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
		Depending on your inputs, the biggest positive contribution to net worth is
		usually growth of the house value. Deducations are dominated by purchase costs
		in the first year, and annual interest payments get smaller as the loan is paid
		off.
	</p>
	<p>
		The situation when renting is simpler. There are two main components: monthly
		rent, and the growth of the initial capital invested in the stock market:
	</p>
	<div>
		<h5 class="plotTitle">Annual change in net worth when renting</h5>
		<NetWorthChart data={d.rentData} domainY={d.domainY} reversed={true} />
	</div>
	<p>
		Any difference in yearly cash expenditure between the two scenarios is called
		"spare cash" and is assumed to be dutifully invested in the stock market. If
		buying costs you €{formatLocale(1800)} in one month but renting only
		€{formatLocale(1500)}, the renter is assumed to have invested the €300
		difference in the stock market.
	</p>
{/if}

{#if true}
<p>
	You can also <a target="_blank" on:click={downloadResultsAsCsv}>download the results
	as a CSV file.</a>
</p>
{/if}

<h2>Which parameters have the biggest impact?</h2>
<p>
	We now ask how sensitive the model is to variations in the input values. The key
	outcome is <i>the number of years it takes for buying to be more financially
	advantageous than renting</i>, if that even occurs. A simple way to test the
	sensitivity of the model is to take each parameter in turn, modify it by plus or
	minus twenty percent, and see how much the outcome changes.
</p>
{#if netWorth}
	{@const sensitivityData = sensitivityAnalysis({
		capitalGainsTax: $capitalGainsTax,
		heatingCostGain: $heatingGain,
		houseAmortisationRate: $houseAmortisationRate,
		houseHeatingCost: $houseHeatingCost * $housePrice / $housePricePerM2,
		houseInterestRate: $houseInterestRate,
		houseMaintenanceCost: $houseMaintenanceCost * $housePrice / $housePricePerM2,
		houseOtherCost: $houseOtherCost * $housePrice / $housePricePerM2,
		housePrice: $housePrice,
		housePriceGain: $housePriceGain,
		housePurchaseCost: $housePurchaseCost,
		houseTax: $houseTax,
		maintenanceCostGain: $maintenanceGain,
		maxYears: $maxYears,
		otherCostgain: $otherCostGain,
		rent: $rent,
		rentGain: $rentGain,
		rentalHeatingCost: $houseHeatingCost * $rent / $rentPerM2,
		rentalMaintenanceCost: $houseMaintenanceCost * $rent / $rentPerM2,
		rentalOtherCost: $houseOtherCost * $rent / $rentPerM2,
		startingCapital: $startingCapital,
		stockMarketGain: $stockMarketGain,
	})}
	<div>
		<h5 class="plotTitle">Effect of altering input parameters</h5>
		<PlotContainer options={{
			style: plotStyle,
			color: { legend: true, range: ["#F98159", "#9DD554"], style: { fontSize: "17px" } },
			marginLeft: 210,
			marginBottom: 50,
			x: {
				label: "Years until net worth from buying exceeds that of renting",
			},
			y: { tickFormat: camelToWord, label: "", domain: sensitivityData.map(d => d.parameter) },
			marks: [
				Plot.ruleX([sensitivityData.base], { stroke: "grey" }),
				Plot.barX(
					sensitivityData,
					{ x1: sensitivityData.base || 0, x: "value", y: "parameter", fill: "modification", insetTop: 6, insetBottom: 6, insetLeft: 2, insetRight: 2},
				),
				Plot.dot(
					sensitivityData,
					{ x: "value", y: "parameter", fill: "modification", r: 5},
				)
			],
			 }}
		/>
	</div>
{/if}
<p>
	For example: when a green bar (an increase of the parameter) goes to the left, it
	means that the increase caused buying to be <i>even more attractive</i> than
	renting.
</p>

<p>
	Typically, the most important parameters are the amount of rent, house price,
	interest rate, and house purchase costs.
</p>

<h2>Limitations</h2>
<p>
	This is a very simple model.
	All market parameters&#8212;the value of the house,
	the growth of the stock market and so on&#8212;are modelled with constant,
	year-on-year growth. That doesn't capture the true stochastic nature of these
	parameters and the risk exposure to them in each scenario.
</p>

<hr style="margin-top: 100px" />

<FootnoteTarget i="1">
	<!-- Starting Capital -->
	A <a href="https://www.interhyp.de/medien/ueber-interhyp/presse/baufinanzierung-in-deutschland-2020-interhyp-studie.pdf">
	study by InterHyp</a> from 2020 reports an average downpayment of 26% of the house
	value.
</FootnoteTarget>

<!--<FootnoteTarget i="2">-->
<!--	&lt;!&ndash; Rent &ndash;&gt;-->
<!--	DeStatis reports the number and total area of real-->
<!--	estate for Berlin (table 31231-0003) for the end of 2021, from which we can derive-->
<!--	an average living area of 73m².-->
<!--</FootnoteTarget>-->

<FootnoteTarget i="2">
	<!-- Rent Gain -->
	DeStatis reports the consumer price index for rentals (table 61111-0004, variable
	CC13-0411) as {formatLocale(108.5)} in June 2021 compared to 100 in June 2015, or
	a {formatLocale(1.4)}% increase per year.
	<!-- or 61111-0020: Index der Nettokaltmieten: Bundesländer, Jahre? -->
</FootnoteTarget>

<!--<FootnoteTarget i="4">-->
<!--	&lt;!&ndash; House price &ndash;&gt;-->
<!--	<a href="https://www.immowelt.de/immobilienpreise/berlin">ImmoWelt reports an-->
<!--	average of {formatLocale(5_128)} €/m² in Berlin</a>.-->
<!--</FootnoteTarget>-->

<FootnoteTarget i="3">
	<!-- House Price Gain -->
	A <a href="https://www.reuters.com/markets/europe/german-house-price-inflation-slow-borrowing-living-costs-bite-2022-05-26/">
    survey by Reuters</a> predicted 2% for 2024.
</FootnoteTarget>

<FootnoteTarget i="4">
	<!-- Stock Market Gain -->
	We take the S&P 500 to be representative of the stock market. This index saw a
	growth of 40% over the last five years, or 7% per year.
</FootnoteTarget>

<FootnoteTarget i="5">
	<!-- Interest -->
	An <a href="https://www.test.de/Immobilienfinanzierung-Schritt-fuer-Schritt-zum-Kredit-5294522-5535292">
	article by <i>Stiftung Warentest</i></a> from November 2022 reports a fifteen-year
	fixed-rate interest of {formatLocale(3.89)}% for a loan of 80% of the house price.
</FootnoteTarget>

<FootnoteTarget i="6">
	<!-- Purchase Cost -->
	Typical purchase costs consist of {formatLocale(3.57)}% broker commission
	(<i>Maklerprovision</i>), 6% property transfer tax (<i>Grunderwerbssteuer</i>), 2%
	notary fees (<i>Notarkosten</i>), and {formatLocale(0.5)}% for the land registry
	entry (<i>Grundbucheintrag</i>).
</FootnoteTarget>

<!--<FootnoteTarget i="10">-->
<!--	&lt;!&ndash; Rent Per M2 &ndash;&gt;-->
<!--	Statista reports an average monthly rent of {formatLocale(12.78)} €/m².-->
<!--	&lt;!&ndash; can do better with kaltmieter index / mietspiegel &ndash;&gt;-->
<!--</FootnoteTarget>-->

<!--<FootnoteTarget i="11">-->
<!--	&lt;!&ndash; House Price Per M2 &ndash;&gt;-->
<!--	<a href="https://www.immowelt.de/immobilienpreise/berlin">ImmoWelt reports an-->
<!--	average of {formatLocale(5_128)} €/m² in Berlin</a>.-->
<!--</FootnoteTarget>-->

<FootnoteTarget i="7">
	<!-- Amortisation -->
	An <a href="https://www.test.de/Immobilienfinanzierung-Schritt-fuer-Schritt-zum-Kredit-5294522-5535292">
	article by <i>Stiftung Warentest</i></a> from November 2022 reports a typical
	amortisation rate of 2%.
</FootnoteTarget>

<FootnoteTarget i="8">
	<!-- Property Tax -->
	The <a href="https://de.wikipedia.org/wiki/Grundsteuer_(Deutschland)#Berechnung_(Wert_%C3%97_Grundsteuermesszahl_%C3%97_Hebesatz)">
	Wikipedia article on property tax in Germany</a> on contains details about the
	calculation. We combine this with <a href="https://www.lexoffice.de/wissenswelt/gewerbesteuerhebesatz/berlin/#hebesatz-bb">
	municipal tax values for Berlin</a> to arrive at a figure of {formatLocale(0.13)}%.
</FootnoteTarget>

<FootnoteTarget i="9">
	<!-- House Heating -->
	A <a href="https://web.archive.org/web/20231010022728/https://www.destatis.de/DE/Presse/Pressemitteilungen/2023/09/PD23_388_61243.html">
	press release from DeStatis</a> reports the average natural gas (the most common
	source of heating) price paid by households in the first half of 2023 as
	{formatLocale(12.26)} ct/kWh. <a href="https://web.archive.org/web/20231007142055/https://www.umweltbundesamt.de/daten/private-haushalte-konsum/wohnen/energieverbrauch-privater-haushalte#mehr-haushalte-grossere-wohnflachen-energieverbrauch-pro-wohnflache-sinkt">
	According to the German ministry of the environment</a> an average energy
	consumption for heating is 125 kWh/m² per year.
</FootnoteTarget>

<FootnoteTarget i="10">
	<!-- House Heating Gain -->
	A long view of the <a href="https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Publikationen/Energiepreise/energiepreisentwicklung-pdf-5619001.html?nn=214072">
	price index for imports of natural gas</a> is provided by DeStatis. It reports a
	price index of {formatLocale(170.1)} in July 2023 compared to {formatLocale(71.1)}
	in January 2023, or {formatLocale(4.8)}% per year.
</FootnoteTarget>

<FootnoteTarget i="11">
	<!-- House Maintenance Cost -->
	An <a href="https://web.archive.org/web/20230830023628/https://www.wuestenrot.de/modernisieren/instandhaltungsruecklage">article
	by Wüstenrot</a> recommends a value of {formatLocale(17.18)} €/m² per year for
	properties older than thirty-two years, {formatLocale(13.45)} €/m² per year for
	properties between thirty-two and twenty-two years old, and {formatLocale(10.61)}
	€/m² per year for properties newer than twenty-two years. We take the middle value.
</FootnoteTarget>

<FootnoteTarget i="12">
	<!-- House Maintenance Gain -->
	DeStatis reports the consumer price index (table 61111-0004) for <i>maintenance and
	repair of the dwelling</i> (variable CC13-043) as {formatLocale(118.1)} in July 2021
	compared to {formatLocale(100.1)}) in July 2015, or {formatLocale(2.8)}% per year.
</FootnoteTarget>

<FootnoteTarget i="13">
	<!-- House Other -->
	The Berlin Senate Department for Urban Development and Housing published
	<a href="https://www.stadtentwicklung.berlin.de/wohnen/betriebskosten/de/tabelle.shtml">
	average utilities figures from 2017</a>, indicating a monthly sum of {formatLocale(2.29)} €/m², if
	we exclude property tax. To this number we apply a rough inflation figure
	(table 61111-0004, variable CC13-04) of 22% from October 2017 to October 2022.
</FootnoteTarget>

<!--<FootnoteTarget i="19">-->
<!--	&lt;!&ndash; House Other Gain &ndash;&gt;-->
<!--</FootnoteTarget>-->

<FootnoteTarget i="14">
	<!-- Capital Gains Tax -->
	Tax on capital gains in Germany is approximately 26%. There is a tax-free allowance,
	but for simplicity we do not include this.
</FootnoteTarget>

<style>
	.collapsed {
		/* collapse ensures that the hidden elements still contribution to the
		 * calculation of table column widths (i.e. widths don't flicker when
		 * (un)collapsing
		 */
		visibility: collapse;
	}

	@media print {
		.collapsed {
			/* visibility: collapse shows as a big chunk of whitespace in print mode */
			display: none
		}
	}

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
	#parametersTable td {
		vertical-align:top;
		line-height: 28.8px;
		border: 0;
	}
	input {
		width: 70px;
	}
	#parametersTable small {
		font-size: small
	}
	#parametersTable tr>td:nth-child(2) {
		/* input box */
		padding-right: 0;
	}
	#parametersTable tr>td:nth-child(3) {
		/* units after input box, e.g. % per year */
		font-size: small;
		white-space: nowrap;
		padding-left: 5px;
	}
</style>
