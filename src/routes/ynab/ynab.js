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
	let url = new URL(endpoint, 'https://api.youneedabudget.com/v1/');
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

export function parseBudget(budget) {
	return (
		budget.month.categories
			// add category group and process millicents
			.map(e => ({ month: new Date(budget.month.month), ...parseMonth(e) }))
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
