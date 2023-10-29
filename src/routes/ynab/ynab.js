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
