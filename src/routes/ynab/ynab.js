/*
 * TODO: better function and variable names!
 */

import * as d3 from 'd3';

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

		if (_cache[serializedArgs])
			return console.log('Return cached result of', serializedArgs) || _cache[serializedArgs];

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
				"is_scheduled": true/false,
				"timeframe":    "year"/"month"/"day",
				"group_id":     string,
				"group":        string,
				"category":     string,
				"category_id":  string,
				"activity":     float

			}
	*/

	// the timeframe is "yearly" if we have a goal, regardless of the due date of the
	// goal, and "monthly" if %monthly% is in the note
	const goal = budgetCategory.goal_target;
	const isYearly = Math.abs(goal) > 0;
	const budgetedMillicents = isYearly ? (goal / 12) : budgetCategory.budgeted;

	// British spelling for 'Uncategorized'
	let categoryGroupName = budgetCategory.category_group_name;
	if (categoryGroupName === "Uncategorized") {
		categoryGroupName = "Uncategorised"
	}

	return {
		is_income: false,
		is_scheduled: (budgetCategory.note || "").includes("%scheduled%"),
		is_yearly: isYearly,
		with_now: (budgetCategory.note || "").includes("%now%"),
		from_savings: (budgetCategory.note || "").includes("%from_savings%"),
		group_id: budgetCategory.category_group_id,
		group: categoryGroupName,
		category: budgetCategory.name,
		category_id: budgetCategory.id,
		activity: -budgetCategory.activity / 1000,
		budgeted: budgetedMillicents / 1000,
	};
}

function monthOfDateString(dateString) {
	const date = new Date(dateString);
	return new Date(date.getFullYear(), date.getMonth(), 1);
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

export function noteIsExclude(note) {
	return (note || "").includes("%exclude%")
}

export function noteIsMonthly(note) {
	return (note || "").includes("%monthly%")
}

export function noteIsYearly(note) {
	return (note || "").includes("%yearly%")
}

export function humanMonth(dateObject) {
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	const monthIndex = dateObject.getMonth();
	return months[monthIndex];
}

export function getMonthFromString(monthString) {
	return humanMonth(new Date(monthString));
}

export const format = x => d3.format(',.2r')(Math.round(x / 10) * 10);
export const formatZero = x => (Math.abs(x) < 5 ? '-' : format(x));

function unroll(rollup, keys, label = 'value', p = {}) {
	return Array.from(rollup, ([key, value]) =>
		value instanceof Map
			? unroll(value, keys.slice(1), label, Object.assign({}, { ...p, [keys[0]]: key }))
			: Object.assign({}, { ...p, [keys[0]]: key, ...value })
	).flat();
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

export async function loadIncome(monthstamps, ynabToken, budgetId) {
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
	return data;
}

export async function loadExpenditure(monthstamps, ynabToken, budgetId) {
	const responses = await Promise.all(
		monthstamps.map(monthstamp => {
			const monthString = parseMonthstamp(monthstamp).dateString;
			return ynab(ynabToken, `budgets/${budgetId}/months/${monthString}`, {})
		})
	)
	return parse(responses);
}

export async function loadTransfers(monthstamps, ynabToken, budgetId, forSankey) {
	// get all transactions since the earliest date in the array
	const sortedMonthstamps = monthstamps.sort(d3.ascending);
	const firstMonthstamp = sortedMonthstamps[0];

	async function getTransactions(accountId) {
		const sinceDate = parseMonthstamp(firstMonthstamp).dateString;
		const response = await ynab(
			ynabToken,
			`budgets/${budgetId}/accounts/${accountId}/transactions`,
			{ since_date: sinceDate },
		);

		// filter transactions to ones that fall in or before the last
		// month in the array
		const lastMonthstamp = sortedMonthstamps[sortedMonthstamps.length - 1];
		const firstDateOfNextMonth = parseMonthstamp(lastMonthstamp + 1).date;
		let transactions = response.transactions.filter(
			t => new Date(t["date"]) < firstDateOfNextMonth
		);

		// ignore zero transactions
		return transactions.filter(t => Math.abs(t.amount) > 0);
	}

	// mortgage transactions
	const mortgageAccountId = "a85376eb-0669-4039-b208-c68938917384";
	let mortgageTransactions = await getTransactions(mortgageAccountId)
	mortgageTransactions = mortgageTransactions.filter(
		t => t.memo !== "Take out Mortgage"
	)
	const mortgageCategories = mortgageTransactions.map(
		t => ({
			activity: t.amount / 1000,
			category_id: "mortgage",
			category: "Mortgage Amortisation",
			group: forSankey ? "Mortgage" : "House",
			group_id: forSankey ? "gMortgage" : "ac164e0b-237d-4a6f-8f95-618760ea9207",
			month: monthOfDateString(t["date"])
		})
	)

	// owings transactions
	const owingsAccountId = "645be5f7-3a5d-4723-a6e9-97929eaf658d";
	const owingsTransactions = await getTransactions(owingsAccountId);
	const owingsCategories = owingsTransactions.map(
		t => ({
			activity: t.amount / 1000,
			category_id: "owings",
			category: "Owings",
			group: forSankey ? "Owings" : "Regular",
			group_id: forSankey ? "gOwings" : "449c5313-e397-4aa7-91f2-400c49ef1301",
			month: monthOfDateString(t["date"]),
			note: "%yearly%",
		})
	)

	return [...mortgageCategories, ...owingsCategories];
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

export function currentMonthstamp() {
	const date = new Date();
	return constructMonthstamp(date.getUTCFullYear(), date.getUTCMonth());
}
