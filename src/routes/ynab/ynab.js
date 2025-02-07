import * as d3 from 'd3';
import _ from 'lodash';

const budgetId = "9c952968-39f3-46e3-aa87-1166c2cb4a37";

function _ynab(token, endpoint, params, i) {
	return new Promise((resolve, reject) =>
		fetch(url(endpoint, params), {
			headers: new Headers({
				Authorization: `Bearer ${token}`
			})
		})
			.then(response => response.json().then(json => ({ ok: response.ok, json })))
			.then(response =>
				response.ok
					? resolve(response.json.data)
					: reject(`${response.json.error.id} ${response.json.error.detail}`)
			)
	);
}


function url(endpoint, params = {}) {
	let url = new URL(endpoint, 'https://api.ynab.com/v1/');
	for (let [name, value] of Object.entries(params)) url.searchParams.append(name, value);
	return url.toString();
}

const serializer = JSON.stringify;

function memoize(fn) {
	let _cache = {};
	return (...args) => {
		const serializedArgs = serializer(args);

		if (_cache[serializedArgs]) return _cache[serializedArgs];

		return (_cache[serializedArgs] = fn.apply(null, args));
	};
}

export const ynab = memoize(_ynab);

export function parseMonth(budgetCategory) {
	/*
		We are expecting an object like this:

			{
				"id": "01d244a5-0208-4dc1-aa13-34f759dbfc50",
				"category_group_id": "cce73f56-26d3-44ec-a36a-2bb5a25d553b",
				"category_group_name": "Transportation",
				"name": "Trains",
				"hidden": false,
				"original_category_group_id": null,
				"note": "",
				"budgeted": 0,
				"activity": 0,
				"balance": 412550,
				"goal_type": "NEED",
				"goal_needs_whole_amount": false,
				"goal_day": null,
				"goal_cadence": 13,
				"goal_cadence_frequency": 1,
				"goal_creation_month": "2025-01-01",
				"goal_target": 100000,
				"goal_target_month": "2025-02-01",
				"goal_percentage_complete": 100,
				"goal_months_to_budget": 2,
				"goal_under_funded": 0,
				"goal_overall_funded": 412550,
				"goal_overall_left": 0,
				"deleted": false
			}

		And we return an object like this:

			{
				"is_income":    false,
				"group_id":     string,
				"group":        string,
				"category":     string,
				"category_id":  string,
				"activity":     float
			}
	*/

	// British spelling for 'Uncategorized'
	let categoryGroupName = budgetCategory.category_group_name;
	if (categoryGroupName === "Uncategorized") {
		categoryGroupName = "Uncategorised"
	}

	return {
		is_income: false,
		group_id: budgetCategory.category_group_id,
		group: categoryGroupName,
		category: budgetCategory.name,
		category_id: budgetCategory.id,
		activity: -budgetCategory.activity / 1000,
	};
}

export function parseBudget(budget) {
	return (
		budget.month.categories
			// ignore income
			.filter(e => e.id !== incomeCategoryId)
			// add category group and process millicents
			.map(e => ({
				monthstamp: monthstampFromDateString(budget.month.month),
				...parseMonth(e)
			}))
	);
}

export const format = x => d3.format(',.2r')(Math.round(x / 10) * 10);
export const formatZero = x => (Math.abs(x) < 5 ? '-' : format(x));

export function groupedSumBudgetedActivity(iterable, getters, level) {
	function unroll(rollup, keys, label = 'value', p = {}) {
		return Array.from(rollup, ([key, value]) =>
			value instanceof Map
				? unroll(value, keys.slice(1), label, Object.assign({}, { ...p, [keys[0]]: key }))
				: Object.assign({}, { ...p, [keys[0]]: key, ...value })
		).flat();
	}

	/* TODO: take groupGetter, nameGetter */

	const asMap = d3.rollup(  // TODO: can we use flatRollup?
			iterable,
			categories => ({
					budgeted: d3.sum(categories, e => e.budgeted),
					activity: d3.sum(categories, e => e.activity),
					scheduled: d3.sum(categories, e => e.scheduled)
			}),
			...Object.values(getters),
	);
	const asArray = unroll(asMap, Object.keys(getters));
	const withLevel = asArray.map(e => ({ ...e, level }));
	return withLevel;
 }


function parsePayee(payee_name, payee_id) {
	if (!payee_name) {
		return ({
			category_group_id: "other",
			category_group_name:"Other",
			id: "uncategorised",
			name: "Uncategorised",
		});
	}
	const i = payee_name.indexOf("|");

	if (i === -1) {
		return ({
			category_group_id: "other",
			category_group_name:"Other",
			id: `p${payee_id}`,
			name: payee_name,
		});
	} else {
		const group = payee_name.substring(0, i).trim();
		const category = payee_name.substring(i + 1).trim();
		return ({
			category_group_id: group,
			category_group_name: group,
			id: payee_id,
			name: category,
		});
	}
}

const incomeCategoryId = "f9fc70b0-df3c-42a9-a49b-76a1e90c4fe8";

async function fetchFromSavingsFromGoogleSheets() {
	let data = await d3.csv(
		"https://docs.google.com/spreadsheets/d/e/2PACX-1vQBwxAcU1N4A021x1EB9J3nmlXc78RrYP2fbD-e3Kqx_R3BXq9mfDf5Y3yyVNgfEPDZlqyTf5su_mv0/pub?gid=1391042149&single=true&output=csv"
	);

	/* Parse to an array of objects like
		{
			category_id: "ed6fde50-45fd-4d2c-9663-22d74c18a83a"
		}
	*/
	data = data.map((d) => ({
		category_id: d.category_id
	}));

	validateAndFilterObjects(data, ["category_id"]);

	return data;
}

async function fetchMonthlyBudgetFromGoogleSheets() {

	/* Fetch an array of objects like
		{
			category_group_name: "Car"
			name: "Petrol"
			category_group_id: "5b818b21-6bdf-4078-8522-6d4eb6987270"
			category_id: "ed6fde50-45fd-4d2c-9663-22d74c18a83a"
			scheduled: "FALSE"
			with_now: "FALSE"
			2025-01: "133"
			2025-02: "133"
			... etc
		}
	*/
	const wideData = await d3.csv(
		"https://docs.google.com/spreadsheets/d/e/2PACX-1vQBwxAcU1N4A021x1EB9J3nmlXc78RrYP2fbD-e3Kqx_R3BXq9mfDf5Y3yyVNgfEPDZlqyTf5su_mv0/pub?gid=0&single=true&output=csv"
	);

	const longData = wideData.flatMap(d => Object.entries(d)
		.filter(([key]) => /^\d{4}-\d{2}$/.test(key)) // Match YYYY-MM format
		.map(([yearMonthString, budget]) => {
			const [yearString, monthString] = yearMonthString.split("-");
			return {
				category_id: d.category_id,
				category: d.name,
				group_id: d.category_group_id,
				group: d.category_group_name,
				is_scheduled: booleanValuesUsedByGoogleSheets.get(d.scheduled),
				with_now: booleanValuesUsedByGoogleSheets.get(d.with_now),
				budget: parseFloat(budget.replace(/,/g, "")),
				monthstamp: constructMonthstamp(
					parseInt(yearString), parseInt(monthString) - 1
				),
			}
		})
	);

	validateAndFilterObjects(longData, [
		"budget",
		"category_id",
		"category",
		"group_id",
		"group",
		"is_scheduled",
		"monthstamp",
		"with_now",
	]);

	return longData;
}

const booleanValuesUsedByGoogleSheets = new Map([
	["FALSE", false],
	["TRUE", true]
]);

async function fetchYearlyBudgetFromGoogleSheets() {

	/* Fetch an array of objects like
		{
			category_group_name: "Car"
			name: "Car Insurance"
			category_group_id: "5b818b21-6bdf-4078-8522-6d4eb6987270",
			id: "4dc8e93e-7b2a-4282-9af1-fafaaefb95b8"
			scheduled: "TRUE"
			with_now: "FALSE"
			budget: "871"
		}
	*/
	let data = await d3.csv(
		"https://docs.google.com/spreadsheets/d/e/2PACX-1vQBwxAcU1N4A021x1EB9J3nmlXc78RrYP2fbD-e3Kqx_R3BXq9mfDf5Y3yyVNgfEPDZlqyTf5su_mv0/pub?gid=885055322&single=true&output=csv"
	);

	/* Parse to an array of objects like
		{
			category_id: "4dc8e93e-7b2a-4282-9af1-fafaaefb95b8",
			category: "Car Insurance",
			group_id: "5b818b21-6bdf-4078-8522-6d4eb6987270",
			group: "Car"
			scheduled: true
			with_now: false
			budget: 871
		}
	*/
	data = data.map((d) => ({
		category_id: d.category_id,
		category: d.name,
		group_id: d.category_group_id,
		group: d.category_group_name,
		is_scheduled: booleanValuesUsedByGoogleSheets.get(d.scheduled),
		with_now: booleanValuesUsedByGoogleSheets.get(d.with_now),
		budget: parseFloat(d.budget.replace(/,/g, ""))
	}));

	validateAndFilterObjects(
		data,
		[
			"budget",
			"category_id",
			"category",
			"group_id",
			"group",
			"is_scheduled",
			"with_now",
		],
	);

	return data;
}

export async function loadIncome(monthstamps, ynabToken) {
	// get all income transactions since the earliest date in the array
	const sortedMonthstamps = monthstamps.sort(d3.ascending);
	const firstMonthstamp = sortedMonthstamps[0];
	const sinceDate = parseMonthstamp(firstMonthstamp).dateString;
	const response = await ynab(
		ynabToken,
		`budgets/${budgetId}/categories/${incomeCategoryId}/transactions`,
		{ since_date: sinceDate },
	)

	// filter transactions to ones that fall in or before the last
	// month in the array
	const lastMonthstamp = sortedMonthstamps[sortedMonthstamps.length - 1];
	const firstDateOfNextMonth = parseMonthstamp(lastMonthstamp + 1).date;
	let transactions = response.transactions.filter(
		t => new Date(t["date"]) < firstDateOfNextMonth
	);

	const data = d3.flatGroup(
		transactions,
		t => t.date.substring(0, 7) + "-01",  // "2024-01-06" -> "2024-01-01"
	).map(
		([monthString, ts]) => ({
			month: ({
				month: monthString,
				categories: d3.flatRollup(
					ts,
					ts_ => d3.sum(ts_, t => t.amount),
					t => t.payee_name,
					t => t.payee_id,
				).map(
					([payee_name, payee_id, amount]) => ({
						activity: -amount,
						...parsePayee(payee_name, payee_id),
					}),
				)
			})
		})
	)

	// TODO: add any missing months
	return parse(data).map(c => ({...c, is_income: true}));
}

export function rangeArray(a, b) {
	return Array.from({ length: b - a }, (_, i) => a + i);
}

async function fetchCategoriesFromYnab(monthstamps, ynabToken) {
	const responses = await Promise.all(
		monthstamps.map(monthstamp => {
			const monthString = parseMonthstamp(monthstamp).dateString;
			return ynab(ynabToken, `budgets/${budgetId}/months/${monthString}`, {})
		})
	)
	return parse(responses)
}

function outerJoin(list1, list2, key) {
	return _.values(
		_.mergeWith(
			_.keyBy(list1, key),
			_.keyBy(list2, key),
			(objValue, srcValue) => _.mergeWith(objValue, srcValue, (a, b) => a ?? b)
		)
	);
}

export async function loadDataForBudget(monthstamp, ynabToken) {

	// fetch budget information from Google sheets
	const monthlyBudget = await fetchMonthlyBudgetFromGoogleSheets().then(
		data => validateAndFilterObjects(
			data.filter(c => c.monthstamp === monthstamp),
			["budget", "category_id", "is_scheduled", "with_now"],
		)
	);
	const yearlyBudget = await fetchYearlyBudgetFromGoogleSheets().then(
		data => validateAndFilterObjects(data, ["budget", "category_id", "is_scheduled", "with_now"])
	);
	const fromSavingsBudget = await fetchFromSavingsFromGoogleSheets();

	// fetch category hierarchy and activity information from YNAB
	const { year } = parseMonthstamp(monthstamp);
	const firstMonthstampOfYear = constructMonthstamp(year, 0);
	const monthstampsSoFarThisYear = rangeArray(firstMonthstampOfYear, monthstamp + 1);
	let categories = await fetchCategoriesFromYnab(monthstampsSoFarThisYear, ynabToken);

	// Google sheets defines which categories are monthly vs. yearly
	// TODO: remove from_savings categories
	const monthlyCategoryIds = new Set(monthlyBudget.map(d => d.category_id));
	const yearlyCategoryIds = new Set(yearlyBudget.map(d => d.category_id));
	const fromSavingsCategoryIds = new Set(fromSavingsBudget.map(d => d.category_id));

	// A category should not be both monthly and yearly!
	// TODO: include from_savings
	const hasOverlap = [...monthlyCategoryIds].some(id => yearlyCategoryIds.has(id));
	if (hasOverlap) {
		console.warn("Warning: Some categories exist in both monthly and yearly budgets");
	}

	// remove from_savings categories
	categories = categories.filter(c => !fromSavingsCategoryIds.has(c.category_id));

	// filter YNAB categories to yearly ones
	const yearlyCategories = categories.filter((c) =>
		yearlyCategoryIds.has(c.category_id)
	);

	// sum up activity over the whole year
	const yearlyCategoriesOverWholeYear = d3
		.flatRollup(
			yearlyCategories,
			(_categories) => ({
				activity: d3.sum(_categories, (c) => c.activity),
				category_id: _categories[0].category_id,
				category: _categories[0].category,
				group_id: _categories[0].group_id,
				group: _categories[0].group,
				is_income: _categories[0].is_income,
				with_now: _categories[0].with_now,
			}),
			// group by keys
			(d) => d.is_income,
			(d) => d.group_id,
			(d) => d.group,
			(d) => d.category,
			(d) => d.category_id,
			(d) => d.with_now,
		)
		.map(([is_income, group_id, group, category, category_id, with_now, row]) => row);

	// merge in information
	const joinedYearly = outerJoin(
		yearlyBudget,
		yearlyCategoriesOverWholeYear,
		"category_id"
	);

	// add any missing properties
	const defaultYearlyProperties = {
		activity: 0,
		budget: 0,
		category_id: "unknown-category-id",
		category: "Unknown",
		group_id: "unknown-group-id",
		group: "Unknown",
		is_income: false,
		is_scheduled: false,
		with_now: false,
	};
	const yearly = joinedYearly.map((item) => ({
		...defaultYearlyProperties, ...item
	}));

	// monthly categories
	const nonYearlyCategories = categories.filter(
		(c) => (c.monthstamp === monthstamp) & !yearlyCategoryIds.has(c.category_id)
	);

	// merge in information
	const joined = outerJoin(monthlyBudget, nonYearlyCategories, "category_id");

	// add any missing properties
	const defaultProperties = {
		...defaultYearlyProperties,
		monthstamp: monthstamp
	};
	const monthly = joined.map((item) => ({ ...defaultProperties, ...item }));

	// remove zero items
	const notZero = (d) => Math.abs(d.activity) > 1 || Math.abs(d.budget) > 1;

	const data = { yearly: yearly.filter(notZero), monthly: monthly.filter(notZero) };

	[...Object.values(data)].forEach(array =>
		validateAndFilterObjects(
			array,
			[
				"activity",
				"budget",
				"category_id",
				"category",
				"group_id",
				"group",
				"is_income",
				"is_scheduled",
				"with_now",
			]
		)
	)

	return data;
}


export async function loadProfitLoss(monthstamps, ynabToken) {
	const income = await loadIncome(monthstamps, ynabToken);
	const expenditure = await fetchDataForExpenditureHistory(monthstamps, ynabToken);

	return [
		...income,
		...expenditure.map(d => ({...d, activity: -d.activity})),
	];
}

export function validateAndFilterObjects(objects, properties) {
	/* Checks if each object in the array contains all the required properties. If any
	 * property is missing or undefined, it throws an error. It returns a new array
	 * where each object only includes the specified properties.
	 *
	 * Example:
	 *
	 *   const data = [
	 *     { name: "Alice", age: 25, extra: "remove this"     },
	 *     { name: "Bob",   age: 30, extra: "remove this too" },
	 *   ];
	 *
	 * Would return
	 *
	 *     { name: "Alice", age: 25 },
	 * 	   { name: "Bob",   age: 30 },
	 */
	return objects.map(item => {
		properties.forEach(property => {
			if (item?.[property] == null) {
				throw new Error(
					`Missing or undefined value for ${property} found in item: ${JSON.stringify(item)}`
				);
			}
		});
		return properties.reduce(
			(acculumator, property) => ({
				...acculumator, [property]: item[property],
			}),
			{},  // initial value
		);
	});
}

export async function fetchDataForExpenditureHistory(monthstamps, ynabToken) {

	// divide monthstamps into future (including today) and past
	const currentMonthstamp_ = currentMonthstamp();
	const isFuture = monthstamp => monthstamp >= currentMonthstamp_;
	const isPast = monthstamp => !isFuture(monthstamp);
	const futureMonthstamps = monthstamps.filter(isFuture)
	const pastMonthstamps = monthstamps.filter(isPast)

	/* --------------------------------------------------------------------------------
	 Data from the past
	-------------------------------------------------------------------------------- */

	// fetch activity from YNAB
	const categories = await fetchCategoriesFromYnab(pastMonthstamps, ynabToken);

	// Google sheets defines which categories are monthly vs. yearly
	const yearlyBudget = await fetchYearlyBudgetFromGoogleSheets();
	const yearlyCategoryIds = new Set(yearlyBudget.map(d => d.category_id));
	const fromSavingsBudget = await fetchFromSavingsFromGoogleSheets();
	const fromSavingsBudgetIds = new Set(fromSavingsBudget.map(d => d.category_id));

	// yearly categories should be averaged by default
    // from savings categories should be hidden by default
	const historicalData = categories.map(c => ({
		...c,
		in_future: false,
		should_average: yearlyCategoryIds.has(c.category_id),
		should_show: !fromSavingsBudgetIds.has(c.category_id)
	}));

	/* --------------------------------------------------------------------------------
	Data from the future

	TODO:
		- add group and category information
		- include yearly categories
	-------------------------------------------------------------------------------- */
	let budgetCategories = await fetchMonthlyBudgetFromGoogleSheets();
	budgetCategories = budgetCategories.filter(c => futureMonthstamps.includes(c.monthstamp));
	const futureData = budgetCategories.map(c => ({
		...c,
		in_future: true,
		should_average: yearlyCategoryIds.has(c.category_id),
		should_show: !fromSavingsBudgetIds.has(c.category_id),
		activity: c.budget,
	}))

	/* --------------------------------------------------------------------------------
	Combine
	-------------------------------------------------------------------------------- */
	const data = [...historicalData, ...futureData];
	validateAndFilterObjects(
		data,
		[
			"activity",
			"category_id",
			"category",
			"group_id",
			"group",
			"in_future",
			"monthstamp",
			"should_average",
			"should_show",
		]
	)

	return data;
}


export function parse(budgets) {
	/* Parse hierarchical budget response (one per month) to a flat list */
	return budgets.flatMap(parseBudget);
}

export function monthstampFromDateString(dateString) {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    return constructMonthstamp(year, month);
}

export function parseMonthstamp(monthstamp) {
    const year = Math.floor(monthstamp / 12);
    const month = monthstamp % 12;
	const date = new Date(Date.UTC(year, month, 1));
	const monthString = date.toLocaleString(undefined, { month: 'long' });
	const dateString = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    return {
		year,         // 2024
		month,        // 0 to 11
		date,         // Date object
		monthString,  // "January"
		dateString,   // "2024-01-01"
	 };
}

export function constructMonthstamp(year, month) {
	return 12 * year + month;
}

export function constructMonthstampFromDateObject(dateObject) {
	return constructMonthstamp(dateObject.getUTCFullYear(), dateObject.getUTCMonth())
}

export function currentMonthstamp() {
	return constructMonthstampFromDateObject(new Date());
}
