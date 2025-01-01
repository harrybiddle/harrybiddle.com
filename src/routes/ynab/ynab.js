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

export const ynab = memoize(_ynab);

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

export function parseMonth(d) {
	return {
		group_id: d.category_group_id,
		group: d.category_group_name,
		category: d.name,
		category_id: d.id,
		note: d.note,
		activity: -d.activity / 1000,
		budgeted: d.budgeted / 1000,
		scheduled: 0,
	};
}

function monthOfDateString(dateString) {
	const date = new Date(dateString);
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function parseBudget(budget) {
	return (
		budget.month.categories
			// add category group and process millicents
			.map(e => ({
				month: monthOfDateString(budget.month.month),
				...parseMonth(e)
			}))
			// ignore income
			.filter(d => ![
					'Inflow: Ready to Assign',
					'Deferred Income SubCategory',
				].includes(d.category)
			)
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

export function groupedSumBudgetedActivityScheduled(iterable, getters, level) {
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


function addOneMonth(my_date) {
	let newDate = new Date(my_date);
	newDate.setMonth(newDate.getMonth() + 1);
	return newDate;
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


export async function loadIncome(monthstamps, ynabToken, budgetId) {
	const incomeCategoryId = "f9fc70b0-df3c-42a9-a49b-76a1e90c4fe8";

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

export function loadExpenditure(monthstamps, ynabToken, budgetId) {
	return Promise.all(
		monthstamps.map(monthstamp => {
			const monthString = parseMonthstamp(monthstamp).dateString;
			return ynab(ynabToken, `budgets/${budgetId}/months/${monthString}`, {})
		})
	)
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
	return budgets.flatMap(parseBudget).filter((d) => d.activity != 0);
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
