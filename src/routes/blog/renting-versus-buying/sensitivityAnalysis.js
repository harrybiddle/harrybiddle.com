import { simulate, calculateNetWorth } from './simulation.js';
import * as d3 from 'd3';

function calculateIntersection(parameters) {
	const data = simulate(
		parameters.capitalGainsTax,
		parameters.heatingCostGain,
		parameters.houseAmortisationRate,
		parameters.houseHeatingCost,
		parameters.houseInterestRate,
		parameters.houseMaintenanceCost,
		parameters.houseOtherCost,
		parameters.housePrice,
		parameters.housePriceGain,
		parameters.housePurchaseCost,
		parameters.houseTax,
		parameters.maintenanceCostGain,
		parameters.maxYears,
		parameters.otherCostgain,
		parameters.rent,
		parameters.rentGain,
		parameters.rentalHeatingCost,
		parameters.rentalMaintenanceCost,
		parameters.rentalOtherCost,
		parameters.startingCapital,
		parameters.stockMarketGain,
	);
	const netWorth = data.filter(r => r.netWorthContributor)
	const intersection = calculateNetWorth(netWorth).intersection;
	if (intersection == null) return null;
	else return intersection[0];
}

export function sensitivityAnalysis(parameterDefaults) {
	const base = calculateIntersection(parameterDefaults);

	const modifyBy = 0.2;

	let data = []
	for (const [parameter, defaultValue] of Object.entries(parameterDefaults)) {
		if (!['maxYears', 'capitalGainsTax'].includes(parameter)) {
			const decrease = {...parameterDefaults, [parameter]: defaultValue * (1 - modifyBy)};
			const increase = {...parameterDefaults, [parameter]: defaultValue * (1 + modifyBy)};
			data.push({parameter, decrease: calculateIntersection(decrease), increase: calculateIntersection(increase)});
		}
	}

	data = data.sort((a, b) =>
       d3.descending(
               Math.abs(a.decrease - base) + Math.abs(a.increase - base),
               Math.abs(b.decrease - base) + Math.abs(b.increase - base)
       )
	);
	data = data.slice(0, 8);

	let ret = Object.assign([], ({base}));;
	for (const row of data) {
		ret.push({parameter: row.parameter, modification: "Decrease by 20%", value: row.decrease})
		ret.push({parameter: row.parameter, modification: "Increase by 20%", value: row.increase})
	}

	return ret;
}
