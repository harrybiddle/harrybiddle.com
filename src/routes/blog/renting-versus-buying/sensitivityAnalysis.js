import { simulate, calculateNetWorth, parameterDefaults } from './simulation.js';
import * as d3 from 'd3';

function calculate(parameters) {
	const [netWorth, cash] = simulate(
		parameters.amortisation,
		parameters.capitalGainsTax,
		parameters.downPayment,
		parameters.fixedCostGain,
		parameters.fixedCost,
		parameters.housePrice,
		parameters.housePriceGain,
		parameters.interest,
		parameters.maxYears,
		parameters.oneOffCost,
		parameters.proportionalCost,
		parameters.rent,
		parameters.rentGain,
		parameters.stockMarketGain
	);

	const intersection = calculateNetWorth(netWorth).intersection;
	if (intersection == null) return null;
	else return intersection[0];
}

const base = calculate(parameterDefaults);

const modifyBy = 0.2;

const modifyByPretty = d3.format('.0%')(modifyBy);

let data = [];

for (const [parameter, defaultValue] of Object.entries(parameterDefaults)) {
	if (!['maxYears', 'capitalGainsTax'].includes(parameter)) {
		const decrease = { ...parameterDefaults, [parameter]: defaultValue * (1 - modifyBy) };
		const increase = { ...parameterDefaults, [parameter]: defaultValue * (1 + modifyBy) };
		data.push({ parameter, decrease: calculate(decrease), increase: calculate(increase) });
	}
}

// sort by size
data = data.sort((a, b) =>
	d3.descending(
		Math.abs(a.decrease - base) + Math.abs(a.increase - base),
		Math.abs(b.decrease - base) + Math.abs(b.increase - base)
	)
);

// print
console.log(`const sensitivityBase = ${base};`);
console.log('const sensitivityData = [');
for (const row of data) {
	console.log(
		`  {"parameter": "${row.parameter}", "modification": "Decrease by ${modifyByPretty}", "value": ${row.decrease}},`
	);
	console.log(
		`  {"parameter": "${row.parameter}", "modification": "Increase by ${modifyByPretty}", "value": ${row.increase}},`
	);
}
console.log('];');
