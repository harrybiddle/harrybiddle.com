import * as d3 from 'd3';

export function computeLoan(housePrice, oneOffCost, downPayment) {
    return Math.max(0, housePrice + oneOffCost - downPayment);
}

export function simulate(
    capitalGainsTax,
    heatingCostGain,
    houseAmortisationRate,
    houseHeatingCost,
    houseInterestRate,
    houseMaintenanceCost,
    houseOtherCost,
    housePrice,
    housePriceGain,
    housePurchaseCost,
    houseTax,
    maintenanceCostGain,
    maxYears,
    otherCostgain,
    rent,
    rentGain,
    rentalHeatingCost,
    rentalMaintenanceCost,
    rentalOtherCost,
    startingCapital,
    stockMarketGain,
) {
    return _simulate(
        parseFloat(capitalGainsTax) / 100,
        parseFloat(heatingCostGain) / 100,
        parseFloat(houseAmortisationRate) / 100,
        parseFloat(houseHeatingCost) * 12,
        parseFloat(houseInterestRate) / 100,
        parseFloat(houseMaintenanceCost) * 12,
        parseFloat(houseOtherCost) * 12,
        parseFloat(housePrice),
        parseFloat(housePriceGain) / 100,
        parseFloat(housePurchaseCost) / 100,
        parseFloat(houseTax) / 100,
        parseFloat(maintenanceCostGain) / 100,
        parseInt(maxYears),
        parseFloat(otherCostgain) / 100,
        parseFloat(rent) * 12,
        parseFloat(rentGain) / 100,
        parseFloat(rentalHeatingCost) * 12,
        parseFloat(rentalMaintenanceCost) * 12,
        parseFloat(rentalOtherCost) * 12,
        parseFloat(startingCapital),
        parseFloat(stockMarketGain) / 100,
    );
}

function _simulate(
    capitalGainsTax,
    heatingCostGain,
    houseAmortisationRate,
    houseHeatingCost,
    houseInterestRate,
    houseMaintenanceCost,
    houseOtherCost,
    housePrice,
    housePriceGain,
    housePurchaseCost,
    houseTax,
    maintenanceCostGain,
    maxYears,
    otherCostgain,
    rent,
    rentGain,
    rentalHeatingCost,
    rentalMaintenanceCost,
    rentalOtherCost,
    startingCapital,
    stockMarketGain,
) {
    /* ---------------------------------------------------------------------------------- */
    // Model Run
    /* ---------------------------------------------------------------------------------- */
    const NewRow = (year, model, superCategory, category, cashExpenditure, netWorthContributor, amount) => ({
        year, model, superCategory, category, cashExpenditure, netWorthContributor, amount
    });
    let data = [];

    // buy starts with a house, a loan, and no stocks
    const oneOffCost = housePurchaseCost * housePrice;
    data.push(NewRow(0, "buy", "Income", "Initial Capital", false, true, startingCapital));
    data.push(NewRow(0, "buy", "Income", "Purchase Costs", false, true, -oneOffCost));
    let buyLoan = computeLoan(housePrice, oneOffCost, startingCapital);
    let buyMortgagePayment = buyLoan * (houseAmortisationRate +  houseInterestRate);
    let buyStocks = 0;
    let _housePrice = housePrice;
    let _houseHeatingCost = houseHeatingCost;
    let _houseMaintenanceCost = houseMaintenanceCost;
    let _houseOtherCost = houseOtherCost;

    // rent's starts with stocks
    data.push(NewRow(0, "rent", "Income", "Initial Capital", false, true, startingCapital));
    let rentStocks = startingCapital;
    let _rent = rent;
    let _rentalHeatingCost = rentalHeatingCost;
    let _rentalMaintenanceCost = rentalMaintenanceCost;
    let _rentalOtherCost = rentalOtherCost;

    for (let y = 1; y < maxYears + 1; y++) {
        // Rent pre-income
        /* ------------------------------------------------------------------------------ */
        let rentOutgoings = 0;

        // stock market grows
        {
            let before = rentStocks;
            rentStocks = Math.max(0, rentStocks * (1 + stockMarketGain));
            let growth = rentStocks - before;

            // pays tax on positive stock market growth
            let tax = Math.max(0, growth) * capitalGainsTax;
            rentOutgoings += tax;

            // add post-tax quantity to net worth
            data.push(NewRow(y, "rent", "Income", "Stock Market", false, true, growth - tax))
        }

        // pays fixed costs
        const c = _houseHeatingCost + _houseMaintenanceCost +_houseOtherCost;
        rentOutgoings += c;
        data.push(NewRow(y, "rent", "Expenditure", "Fixed Costs", true, true, -c))

        // pays rent
        rentOutgoings += _rent;
        data.push(NewRow(y, "rent", "Expenditure", "Rent", true, true, -_rent))

        // Buy pre-income
        /* ------------------------------------------------------------------------------ */
        let buyOutgoings = 0;

        // stock market grows
        {
            let before = buyStocks;
            buyStocks = Math.max(0, buyStocks * (1 + stockMarketGain));
            let growth = buyStocks - before;

            // pays tax on positive stock market growth
            // TODO exclude tax from outgoings for a simpler graph
            let tax = Math.max(0, growth) * capitalGainsTax;
            buyOutgoings += tax;

            // add post-tax quantity to net worth
            data.push(NewRow(y, "buy", "Income", "Stock Market", false, true, growth - tax))
        }

        // house price grows
        let before = _housePrice;
        _housePrice = Math.max(0, _housePrice * (1 + housePriceGain));
        let growth = _housePrice - before;
        data.push(NewRow(y, "buy", "Income", "House Growth", false, true, growth))

        // pays interest
        // TODO: handle negative values?
        let i = buyLoan * houseInterestRate;
        buyOutgoings += i;
        data.push(NewRow(y, "buy", "Expenditure", "Interest", true, true, -i))

        // pays amortisation (note, does not affect net worth!)
        let a = Math.min(
            buyLoan,
            Math.max(0, buyMortgagePayment - i)
        );
        buyOutgoings += a;
        buyLoan -= a;
        data.push(NewRow(y, "buy", "Expenditure", "Amortisation", true, false, -a))

        // pays fixed and proportional costs
        const f = _houseHeatingCost + _houseMaintenanceCost +_houseOtherCost;
        buyOutgoings += f;
        data.push(NewRow(y, "buy", "Expenditure", "Fixed Costs", true, true, -f))

        let p = houseTax * _housePrice;
        buyOutgoings += p;
        data.push(NewRow(y, "buy", "Expenditure", "Property Tax", true, true, -p))

        // Income calculation
        /* ------------------------------------------------------------------------------ */
        let income = Math.max(rentOutgoings, buyOutgoings);

        // Investment of spare cash
        /* ------------------------------------------------------------------------------ */
        let buySpareIncome = income - buyOutgoings;
        data.push(NewRow(y, "buy", "Income", "Spare Cash", false, true, buySpareIncome))
        buyStocks += buySpareIncome;

        let rentSpareIncome = income - rentOutgoings;
        data.push(NewRow(y, "rent", "Income", "Spare Cash", false, true, rentSpareIncome))
        rentStocks += rentSpareIncome;

        // Inflation
        /* ------------------------------------------------------------------------------ */
        _rent *= 1 + rentGain;
        _houseHeatingCost *= 1 + heatingCostGain;
        _houseMaintenanceCost *= 1 + maintenanceCostGain;
        _houseOtherCost *= 1 + otherCostgain;
        _rentalHeatingCost *= 1 + heatingCostGain;
        _rentalMaintenanceCost *= 1 + maintenanceCostGain;
        _rentalOtherCost *= 1 + otherCostgain;
    }
    return data.filter(d => d.amount !== 0)
}

export function calculateNetWorth(netWorth) {
    // the net worth data is broken out per item. let's sum up the total amount per year
    // and model
    const changeInNetWorthPerModelAndYear = d3.rollup(
        // the cumulative sum below relies on years being in order: let's do a sort to
        // guarantee this is the case
        netWorth.sort((a, b) => d3.ascending(a.year, b.year)),
        items => d3.sum(items, d => d.amount),
        d => d.model,
        d => d.year
    );

    // now we need a cumulative sum so that we can track net worth over time
    function cumulativeSum(model) {
        return (
            Array.from(changeInNetWorthPerModelAndYear.get(model).entries())
                .reduce((accumulator, [year, amount], index) => {
                    if (index === 0) {
                        return [[year, amount]];
                    } else {
                        const runningTotal = accumulator[accumulator.length - 1][1];
                        return [...accumulator, [year, runningTotal + amount]];
                    }
                }, [])
                // convert a flat array-of-arrays like [[0, 100], ...] to an array of objects like
                // [{year: 0, amount: 100, model: "buy"}, ...], for more readable code later
                .map(([year, amount]) => ({ year, amount, model }))
        );
    }
    const buy = cumulativeSum('buy');
    const rent = cumulativeSum('rent');
    const intersection = intersect(
        buy.map(d => [d.year, d.amount]),
        rent.map(d => [d.year, d.amount])
    );
    return Object.assign([...buy, ...rent], { intersection });
}

export function intersect(a, b) {
    /*
    For coordinates of piecewise linear lines a and b, return the coordinate where a
    crosses above b. Assumes that both a and b are the same length.
     */
    // handle empty
    if (!(a.length && b.length)) return null;

    // check first value
    let [ax0, ay0] = a[0];
    let [bx0, by0] = b[0];
    if (ay0 >= by0) return [(ax0 + bx0) / 2, (ay0 + by0) / 2];

    // look for an intersection
    for (let [[ax1, ay1], [bx1, by1]] of d3.zip(a.slice(1), b.slice(1))) {
        if (ay1 >= by1) {
            // to improve the numerics, normalise all numbers
            const sx = (ax0 + ax1 + bx0 + bx1) / 4;
            ax0 /= sx;
            ax1 /= sx;
            bx0 /= sx;
            bx1 /= sx;

            const sy = (ay0 + ay1 + by0 + by1) / 4;
            ay0 /= sy;
            ay1 /= sy;
            by0 /= sy;
            by1 /= sy;

            // compute intersection
            const d = (ax0 - ax1) * (by0 - by1) - (ay0 - ay1) * (bx0 - bx1);
            const X = ((ax0 * ay1 - ay0 * ax1) * (bx0 - bx1) - (ax0 - ax1) * (bx0 * by1 - by0 * bx1)) / d;
            const Y = ((ax0 * ay1 - ay0 * ax1) * (by0 - by1) - (ay0 - ay1) * (bx0 * by1 - by0 * bx1)) / d;
            return [sx * X, sy * Y];
        }

        // update start of segment
        [ax0, ay0, bx0, by0] = [ax1, ay1, bx1, by1];
    }

    // failed to find an intersection
    return null;
}

function zipLongest() {
    // From https://stackoverflow.com/a/10284006
    const args = [].slice.call(arguments);
    const longest = args.reduce(function(a, b) {
        return a.length > b.length ? a : b;
    }, []);

    return longest.map(function(_, i) {
        return args.map(function(array) {
            return array[i];
        });
    });
}

export function constructCashTableData(cash) {
    const cashFirstYear = cash
        .filter(d => d.year === 1)
        .map(d => ({ ...d, amount: d.amount / 12 }))
        .sort((a, b) => d3.ascending(a.amount, b.amount));
    const buyCash = cashFirstYear.filter(d => d.model === 'buy');
    const rentCash = cashFirstYear.filter(d => d.model === 'rent');
    const zipped = zipLongest(buyCash, rentCash);
    return Object.assign(zipped, {
        totals: [d3.sum(buyCash, d => d.amount), d3.sum(rentCash, d => d.amount)]
    });
}

export function netWorthChartData(netWorth) {
    /*
    A bunch of calculations for the "annual change in net worth" charts
    */

    // first remove the entry for initial capital, since this isn't interesting for the
    // comparison
    const filtered = netWorth.filter(a => a.category !== 'Initial Capital');

    // here we calculate the range of the y-axes. we need to calculate the extent of
    // both models to ensure the y-axis is the same on both charts
    const yAxisRange = d3.extent(
        d3
            .flatRollup(
                filtered,
                v => d3.sum(v, d => d.amount),
                d => d.model,
                d => d.year,
                d => d.amount < 0
            )
            .map(d => d[d.length - 1])
    );

    return {
        domainY: yAxisRange,
        data: Array.from(d3.group(filtered, d => d.model).entries()),
        buyData: filtered.filter(d => d.model === 'buy'),
        rentData: filtered.filter(d => d.model === 'rent')
    };
}

const twoSF = x => parseFloat(x.toPrecision(2));

const areaM2 = 73;
const housePrice = 5_128 * areaM2;

export const parameterDefaults = {
    maxYears: 30,
    stockMarketGain: 7, // percentage per year
    capitalGainsTax: 26, // percentage per year
    rent: twoSF(12.78 * areaM2), // money per month
    rentGain: 3, // percentage per year
    housePrice: twoSF(housePrice), // money
    housePriceGain: 3.2, // percentage per year
    downPayment: twoSF(0.26 * housePrice), // money
    oneOffCost: twoSF(0.1564 * housePrice), // money
    interest: 3.89, // percentage per year
    amortisation: 2, // percentage per year
    fixedCost: twoSF(2.29 * 1.22 * areaM2), // money per month
    fixedCostGain: 2.8, // percentage per year
    proportionalCost: 0.13 // percentage
};

export function camelToWord(text) {
    const t = text.replace(/([A-Z])/g, ' $1');
    return t.charAt(0).toUpperCase() + t.slice(1);
}

export function prepareDataForCsvDownload(data) {
    /* This function takes the data array, which is in long form:

           [
               {
                   "year": 0,
                   "model": "buy",
                   "superCategory": "Income",
                   "category": "Initial Capital",
                   "cashExpenditure": false,
                   "netWorthContributor": true,
                   "amount": 97000
               },
               ...
           ]

        And converts it into a wide form where each year is a column and cells
        are the sum of the amounts:

            [
                {
                    "Model": "buy",
                    "Category": "Income",
                    "Sub-Category": "Initial Capital",
                    "Affects Net Worth": "true",
                    "Year 0": "97000",
                    "Year 1": "",
                    ...
                },
                ...
            ]
     */

    // we need to pivot to make years into columns. Group by everything _except_ year
    const rows = groupBy(data, (d) => [
        d.model,
        d.superCategory,
        d.category,
        d.netWorthContributor
    ]);

    // each row will start with every year having a zero amount
    const [minYear, maxYear] = d3.extent(data, (d) => d.year);
    const amounts = range(minYear, maxYear + 1).map((y) => [y, 0]);

    const pivoted = Object.entries(rows).map(([key, values]) => {
        // extract the values from the object key
        // (javascript forces us to go via a string, since Map keys and Object properties
        // can only really be strings)
        const [
            model,
            superCategory,
            category,
            netWorthContributor
        ] = key.split(",");

        // start off with a zero amount for each year
        const m = new Map(amounts);

        // now add each amount to the right year
        values.forEach((v) => m.set(v.year, v.amount + m.get(v.year)));

        // convert the map to an object, e.g. {"Year 0": 100, "Year 1": 50, ...}
        const yearColumns = Object.fromEntries(
            [...m.entries()].map(([year, amount]) => [
                // instead of the headers being ["0", "1", ...] we make them
                // ["Year 0", "Year 1", ...] to be more user-friendly
                `Year ${year}`,
                // round floats and convert 0 to the empty string
                (Math.round(amount) || "").toString()
            ])
        );

        // now return the object representing the row
        return {
            Model: titleCase(model),
            Category: superCategory,
            "Sub-Category": category,
            "Affects Net Worth": netWorthContributor,
            ...yearColumns
        };
    });

    const sorted = pivoted.sort((a, b) =>
        a["Model"].localeCompare(b["Model"]) ||
        a["Category"].localeCompare(b["Category"]) ||
        a["Sub-Category"].localeCompare(b["Sub-Category"])
    );

    let previousModel = undefined;
    let previousCategory = undefined;
    sorted.forEach(item => {
        // Affects Net Worth
        if (item["Category"] !== "Expenditure") {
            item["Affects Net Worth"] = ""
        }

        // Model
        if (item["Model"] === previousModel) { item["Model"] = "" }
        else { previousModel = item["Model"] }

        // Category
        if (item["Category"] === previousCategory) { item["Category"] = "" }
        else { previousCategory = item["Category"] }
    })
    return sorted;
}

function range (start, stop, step = 1) {
    return Array(Math.ceil((stop - start) / step))
        .fill(start)
        .map((x, y) => x + y * step)
}

function groupBy (arr, keysSupplier) {
    return arr.reduce((obj, elt) => {
        let key = keysSupplier(elt)
        if (obj[key] === undefined)
            obj[key] = []
        obj[key].push(elt)
        return obj
    }, {})
}

function titleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}
