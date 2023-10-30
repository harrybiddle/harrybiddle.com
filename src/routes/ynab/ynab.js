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
        obj: d
    });
};

export function processBudget(budget) {

    const parsedCategories = budget.month.categories
        // add category group and process millicents
        .map(parseMonth)
        // ignore income
        .filter(d => d.group !== "Internal Master Category")
        // ignore the activity of "One-Off": just set to be equal to budgeted
        .map(e => {
            if (e.group === "One-Off") {
                e.scheduled = e.budgeted;
                e.activity = e.budgeted;
            } else if (e.group === "Scheduled") {
                e.scheduled = e.budgeted;
                e.activity = Math.max(e.activity, e.budgeted);
            }
            return e
        })

    // sum up regular budgets
    const sumBudgeted = (items) => d3.sum(items, (e) => e.budgeted);
    const sumActivity = (items) => d3.sum(items, (e) => e.activity);
    const sumScheduled = (items) => d3.sum(items, (e) => e.scheduled);
    const totalBudgeted = sumBudgeted(parsedCategories);
    const totalActivity = sumActivity(parsedCategories);
    const totalScheduled = sumScheduled(parsedCategories);

    const final = d3
        // group items by "group"
        .flatGroup(parsedCategories, (d) => d.group)
        // over each group, add rows to the table
        .reduce(
          (accumulator, [group, items], index, array) => {
            const sortedItems = items
              .sort((a, b) => d3.descending(a.category, b.category))
              .sort((a, b) => d3.descending(a.budgeted, b.budgeted));
            const groupTotalActivity = sumActivity(items);
            const groupTotalBudgeted = sumBudgeted(items);
            const groupTotalScheduled = sumScheduled(items);
            return [
              ...accumulator,
              // return the total for this group
              {
                level: 1,
                name: group,
                budgeted: groupTotalBudgeted,
                activity: groupTotalActivity,
                scheduled: groupTotalScheduled,
              },
              // if the group is "Regular", also include each category
              ...((group === "Regular") || (group == "Transportation")
                ? sortedItems.map((d) => ({
                    level: 0,
                    name: d.category,
                    budgeted: d.budgeted,
                    activity: d.activity,
                    scheduled: d.scheduled,
                  }))
                : [])
            ];
          },
          [
            {
              level: 2,
              name: "Total",
              budgeted: totalBudgeted,
              activity: totalActivity,
              scheduled: totalScheduled,
            }
          ]
        )

    return final;
}

export function getMonthFromString(monthString) {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const date = new Date(monthString);
      const monthIndex = date.getMonth();
      return months[monthIndex];
}

const format = x => d3.format(",.2r")(Math.round(x / 10) * 10)
export const formatZero = x => x == 0 ? "-" : format(x);
