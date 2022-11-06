import { simulate, calculateNetWorth, parameterDefaults } from './simulation.js';
import * as d3 from 'd3';

function calculate(parameters) {
	const [netWorth, cash] = simulate(
		parameters.amortization,
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

const d = calculate(parameterDefaults);
console.log(`const sensitivityBase = ${d};`);
console.log('const sensitivityData = [');

const modifyBy = 0.2;

const modifyByPretty = d3.format('.0%')(modifyBy);

for (const [parameter, defaultValue] of Object.entries(parameterDefaults)) {
	if (!['maxYears', 'capitalGainsTax'].includes(parameter)) {
		const decrease = { ...parameterDefaults, [parameter]: defaultValue * (1 - modifyBy) };
		const increase = { ...parameterDefaults, [parameter]: defaultValue * (1 + modifyBy) };

		const decreaseValue = calculate(decrease);
		const increaseValue = calculate(increase);

		console.log(
			`  {"parameter": "${parameter}", "modification": "Decrease by ${modifyByPretty}", "value": ${decreaseValue}},`
		);
		console.log(
			`  {"parameter": "${parameter}", "modification": "Increase by ${modifyByPretty}", "value": ${increaseValue}},`
		);
	}
}

console.log('];');
