import * as d3 from 'd3';

function _ynab (token, endpoint, params, i) {
  return new Promise((resolve, reject) =>
      fetch(url(endpoint, params), {
        headers: new Headers({
          Authorization: `Bearer ${token}`
        })
      })
          .then((response) =>
              response.json().then((json) => ({ok: response.ok, json}))
          )
          .then((response) =>
              response.ok
                  ? resolve(response.json.data)
                  : reject(`${response.json.error.id} ${response.json.error.detail}`)
          )
  )
}

export const ynab = memoize(_ynab);

function url(endpoint, params = {}) {
  let url = new URL(endpoint, "https://api.youneedabudget.com/v1/");
  for (let [name, value] of Object.entries(params))
    url.searchParams.append(name, value);
  return url.toString();
}

const serializer = JSON.stringify;

function memoize(fn) {
  let _cache = {};
  return (...args) => {
    const serializedArgs = serializer(args);

    if (_cache[serializedArgs])
      return console.log('Return cached result of', serializedArgs) || _cache[serializedArgs];

    return _cache[serializedArgs] = fn.apply(null, args);
  };
};


export function parseMonth(d) {
    return ({
        group: d.category_group_name,
        category: d.name,
        activity: -d.activity / 1000,
        budgeted: d.budgeted / 1000,
        scheduled: 0,

    });
};


export function parseBudget(budget) {
    return budget.month.categories
        // add category group and process millicents
        .map(e => ({ month: new Date(budget.month.month), ...parseMonth(e) }))
        // ignore income
        .filter(d => d.group !== "Internal Master Category")

}

function humanMonth(dateObject) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthIndex = dateObject.getMonth();
    return months[monthIndex];
}


export function getMonthFromString(monthString) {
    return humanMonth(new Date(monthString));
}

const format = x => d3.format(",.2r")(Math.round(x / 10) * 10)
export const formatZero = x => x == 0 ? "-" : format(x);

function unroll(rollup, keys, label = "value", p = {}) {
  return Array.from(rollup, ([key, value]) =>
    value instanceof Map
      ? unroll(
          value,
          keys.slice(1),
          label,
          Object.assign({}, { ...p, [keys[0]]: key })
        )
      : Object.assign({}, { ...p, [keys[0]]: key, ...value })
  ).flat();
}

function groupedSumBudgetedActivityScheduled(iterable, keyFunction, level) {
  const rolled = d3.rollup(
    iterable,
    (categories) => ({
      budgeted: d3.sum(categories, (e) => e.budgeted),
      activity: d3.sum(categories, (e) => e.activity),
      scheduled: d3.sum(categories, (e) => e.scheduled)
    }),
    (e) => e.month,
    (e) => e.group,
    keyFunction
  );
  return unroll(rolled, ["month", "group", "name"]).map((e) => ({
    ...e,
    level
  }));
}

export function sumBudgets(categories) {
  const data = [
    ...groupedSumBudgetedActivityScheduled(
      categories.map((e) => ({ ...e, group: "Total" })),
      (category) => "Total",
      2
    ),
    ...groupedSumBudgetedActivityScheduled(
      categories,
      (category) => category.group,
      1
    ),
    ...groupedSumBudgetedActivityScheduled(
      categories,
      (category) => category.category,
      0
    )
  ];

  return data.sort((a, b) => {
    // An object with level = 2 always comes first
    if (a.level === 2 && b.level !== 2) return -1;
    if (a.level !== 2 && b.level === 2) return 1;

    // First, compare by the "group" property
    if (a.group < b.group) return 1;
    if (a.group > b.group) return -1;

    // If the "group" properties are equal, compare by the "level" property
    if (a.level < b.level) return 1;
    if (a.level > b.level) return -1;

    // If the "level" properties are equal, compare by the "category" property
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;

    return 0; // Objects are considered equal
  });
}
