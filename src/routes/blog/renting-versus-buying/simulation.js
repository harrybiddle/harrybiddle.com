import * as d3 from 'd3';

export function computeLoan(housePrice, oneOffCost, downPayment) {
	return Math.max(0, housePrice + oneOffCost - downPayment);
}

export function simulate(
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
) {
	return _simulate(
		amortization / 100,
		capitalGainsTax / 100,
		downPayment,
		fixedCostGain / 100,
		fixedCost * 12,
		housePrice,
		housePriceGain / 100,
		interest / 100,
		maxYears,
		oneOffCost,
		proportionalCost / 100,
		rent * 12,
		rentGain / 100,
		stockMarketGain / 100
	);
}

export function _simulate(
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
) {
	/* ---------------------------------------------------------------------------------- */
	// Model Run
	/* ---------------------------------------------------------------------------------- */

	let netWorth = [];
	let cash = [];
	const Row = (year, model, category, amount) => ({
		year,
		model,
		category,
		amount
	});

	// bob starts with a house, a loan, and no stocks
	netWorth.push(Row(0, 'bob', 'initial capital', downPayment));
	netWorth.push(Row(0, 'bob', 'one off costs', -oneOffCost));
	let bobLoan = computeLoan(housePrice, oneOffCost, downPayment);
	let bobStocks = 0;
	let bobHouse = housePrice;
	let _fixedCost = fixedCost;

	// rachel's starts with stocks
	netWorth.push(Row(0, 'rachel', 'initial capital', downPayment));
	let rachelStocks = downPayment;
	let _rent = rent;

	for (let y = 1; y < maxYears + 1; y++) {
		// Rachel pre-income
		/* ------------------------------------------------------------------------------ */
		let rachelOutgoings = 0;

		// stock market grows
		{
			let before = rachelStocks;
			rachelStocks = Math.max(0, rachelStocks * (1 + stockMarketGain));
			let growth = rachelStocks - before;
			netWorth.push(Row(y, 'rachel', 'stock market growth', growth));

			// pays tax on positive stock market growth
			let tax = Math.max(0, growth) * capitalGainsTax;
			rachelOutgoings += tax;
			netWorth.push(Row(y, 'rachel', 'stock market tax', -tax));
			cash.push(Row(y, 'rachel', 'stock market tax', -tax));
		}

		// pays rent
		rachelOutgoings += _rent;
		netWorth.push(Row(y, 'rachel', 'rent', -_rent));
		cash.push(Row(y, 'rachel', 'rent', -_rent));

		// Bob pre-income
		/* ------------------------------------------------------------------------------ */
		let bobOutgoings = 0;

		// stock market grows
		{
			let before = bobStocks;
			bobStocks = Math.max(0, bobStocks * (1 + stockMarketGain));
			let growth = bobStocks - before;
			netWorth.push(Row(y, 'bob', 'stock market growth', growth));

			// pays tax on positive stock market growth
			let tax = Math.max(0, growth) * capitalGainsTax;
			bobOutgoings += tax;
			netWorth.push(Row(y, 'bob', 'stock market tax', -tax));
			cash.push(Row(y, 'bob', 'stock market tax', -tax));
		}

		// house price grows
		{
			let before = bobHouse;
			bobHouse = Math.max(0, bobHouse * (1 + housePriceGain));
			let growth = bobHouse - before;
			netWorth.push(Row(y, 'bob', 'house growth', growth));
		}

		// pays interest
		let i = bobLoan * interest;
		bobOutgoings += i;
		netWorth.push(Row(y, 'bob', 'interest', -i));
		cash.push(Row(y, 'bob', 'interest', -i));

		// pays amortization (note, does not affect net worth!)
		let a = bobLoan * amortization;
		bobOutgoings += a;
		bobLoan -= a;
		cash.push(Row(y, 'bob', 'amortization', -a));

		// pays fixed and proportional costs
		bobOutgoings += _fixedCost;
		netWorth.push(Row(y, 'bob', 'fixed costs', -_fixedCost));
		cash.push(Row(y, 'bob', 'fixed costs', -_fixedCost));

		let _proportionalCost = proportionalCost * bobHouse;
		bobOutgoings += _proportionalCost;
		netWorth.push(Row(y, 'bob', 'proportional costs', -_proportionalCost));
		cash.push(Row(y, 'bob', 'proportional costs', -_proportionalCost));

		// Income calculation
		/* ------------------------------------------------------------------------------ */
		let income = Math.max(rachelOutgoings, bobOutgoings);

		// Investment of spare income
		/* ------------------------------------------------------------------------------ */
		let bobSpareIncome = income - bobOutgoings;
		netWorth.push(Row(y, 'bob', 'spare income (invested)', bobSpareIncome));
		bobStocks += bobSpareIncome;

		let rachelSpareIncome = income - rachelOutgoings;
		netWorth.push(Row(y, 'rachel', 'spare income (invested)', rachelSpareIncome));
		rachelStocks += rachelSpareIncome;

		// Inflation
		/* ------------------------------------------------------------------------------ */
		_rent *= 1 + rentGain;
		_fixedCost *= 1 + fixedCostGain;
	}

	return [netWorth, cash].map(data => data.filter(d => d.amount !== 0));
}

export function calculateNetWorth(netWorth) {
	// the net worth data is broken out per item. let's sum up the total amount per year
	// and model
	const changeInNetWorthPerModelAndYear = d3.rollup(
		// the cumulative sum below relies on years being in order: let's do an extra sort
		// to program defensively
		netWorth.sort((a, b) => d3.ascending(a.year, b.year)),
		items => d3.sum(items, d => d.amount),
		d => d.model,
		d => d.year
	);

	// now we need a cumulative sum so that we can track net worth over time
	function cumulativeSum(model) {
		return (
			Array.from(changeInNetWorthPerModelAndYear.get(model).entries())
				.reduce((accumulator, [year, amount], index) => {
					if (index === 0) {
						return [[year, amount]];
					} else {
						const runningTotal = accumulator[accumulator.length - 1][1];
						return [...accumulator, [year, runningTotal + amount]];
					}
				}, [])
				// convert a flat array-of-arrays like [[0, 100], ...] to an array of objects like
				// [{year: 0, amount: 100, model: "bob"}, ...], for more readable code later
				.map(([year, amount]) => ({ year, amount, model }))
		);
	}
	const bob = cumulativeSum('bob');
	const rachel = cumulativeSum('rachel');
	const intersection = intersect(
		bob.map(d => [d.year, d.amount]),
		rachel.map(d => [d.year, d.amount])
	);
	return Object.assign([...bob, ...rachel], { intersection });
}

export function intersect(a, b) {
	/*
	For coordinates of piecewise linear lines a and b, return the coordinate where a
	crosses above b. Assumes that both a and b are the same length.
	 */
	// handle empty
	if (!(a.length && b.length)) return null;

	// check first value
	let [ax0, ay0] = a[0];
	let [bx0, by0] = b[0];
	if (ay0 >= by0) return [(ax0 + bx0) / 2, (ay0 + by0) / 2];

	// look for an intersection
	for (let [[ax1, ay1], [bx1, by1]] of d3.zip(a.slice(1), b.slice(1))) {
		if (ay1 >= by1) {
			// to improve the numerics, normalise all numbers
			const sx = (ax0 + ax1 + bx0 + bx1) / 4;
			ax0 /= sx;
			ax1 /= sx;
			bx0 /= sx;
			bx1 /= sx;

			const sy = (ay0 + ay1 + by0 + by1) / 4;
			ay0 /= sy;
			ay1 /= sy;
			by0 /= sy;
			by1 /= sy;

			// compute intersection
			const d = (ax0 - ax1) * (by0 - by1) - (ay0 - ay1) * (bx0 - bx1);
			const X = ((ax0 * ay1 - ay0 * ax1) * (bx0 - bx1) - (ax0 - ax1) * (bx0 * by1 - by0 * bx1)) / d;
			const Y = ((ax0 * ay1 - ay0 * ax1) * (by0 - by1) - (ay0 - ay1) * (bx0 * by1 - by0 * bx1)) / d;
			return [sx * X, sy * Y];
		}

		// update start of segment
		[ax0, ay0, bx0, by0] = [ax1, ay1, bx1, by1];
	}

	// failed to find an intersection
	return null;
}

function zipLongest() {
	// From https://stackoverflow.com/a/10284006
	const args = [].slice.call(arguments);
	const longest = args.reduce(function(a, b) {
		return a.length > b.length ? a : b;
	}, []);

	return longest.map(function(_, i) {
		return args.map(function(array) {
			return array[i];
		});
	});
}

export function constructCashTableData(cash) {
	const cashFirstYear = cash
		.filter(d => d.year === 1)
		.map(d => ({ ...d, amount: d.amount / 12 }))
		.sort((a, b) => d3.ascending(a.amount, b.amount));
	const bobCash = cashFirstYear.filter(d => d.model === 'bob');
	const rachelCash = cashFirstYear.filter(d => d.model === 'rachel');
	const zipped = zipLongest(bobCash, rachelCash);
	return Object.assign(zipped, {
		totals: [d3.sum(bobCash, d => d.amount), d3.sum(rachelCash, d => d.amount)]
	});
}

export function netWorthChartData(netWorth) {
	/*
	A bunch of calculations for the "annual change in net worth" charts
	*/

	// first remove the entry for initial capital, since this isn't interesting for the
	// comparison
	const filtered = netWorth.filter(a => a.category !== 'initial capital');

	// here we calculate the range of the y-axes. wew would  like the y-axis to be the
	// same on both charts. So we need to calculate the extent of both stacked charts
	const yAxisRange = d3.extent(
		d3
			.flatRollup(
				filtered,
				v => d3.sum(v, d => d.amount),
				d => d.model,
				d => d.year,
				d => d.amount < 0
			)
			.map(d => d[d.length - 1])
	);

	return {
		domainY: yAxisRange,
		data: Array.from(d3.group(filtered, d => d.model).entries()),
		bobData: filtered.filter(d => d.model === 'bob'),
		rachelData: filtered.filter(d => d.model === 'rachel')
	};
}

export const parameterDefaults = {
	maxYears: 30,
	stockMarketGain: 7, // percentage per year
	capitalGainsTax: 26, // percentage per year
	rent: 1_600, // money per year
	rentGain: 1.4, // percentage per year, from https://www.statista.com/statistics/1270341/rental-index-development-germany/
	housePrice: 450_000, // money
	housePriceGain: 7, //4.6, // percentage per year, from https://www.statista.com/statistics/329715/house-price-index-in-germany/
	downPayment: 150_000, // money
	oneOffCost: 60_000, // money
	interest: 4, // percentage per year
	amortization: 2, // percentage per year
	fixedCost: 630, // money per month
	fixedCostGain: 2.7, // percentage per year
	proportionalCost: 1.3 // percentage
};

export function camelToWord(text) {
	const t = text.replace(/([A-Z])/g, ' $1');
	return t.charAt(0).toUpperCase() + t.slice(1);
}
