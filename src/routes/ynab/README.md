
To start Squid:

```shell
# start
sudo squid -k start

# cehck configuration
sudo squid -k check

# configuration file
/usr/local/etc/squid/squid.conf
```

# To-do's

- Add income in somewhere
- Add "g" and "c" prefixes during data load
- Font size and scale is a mess!
- General caching proxy

## Budget chart:

- Two predictions: what's been budgeted, and what is projected (based on an improved algorithm!)
- Expand top transactions

## One-off chart

- Re-make using a sparkbar for the whole year

## History chart

- A single configuration for all three charts (income/expenditure/net) and put the three charts in tabs.
- Averaging chart:
  - Shorten y-axis labels with truncate/ellipses instead of having a big margin, or wrap them
    https://github.com/observablehq/plot/issues/394
  - Cashflow averaging chart should be a vertical waterfall
- Both charts:
  - Pass in ids, not names, in case of clashes
  - Add back stable discrete colour scheme
  - Centre the "average spent" text
  - Bigger font size in legend
  - Find some way to avoid scrolling between settings and the chart itself (collapse sidebar?)
- Configuration:
  - Bug where radio option for Monthly/Averaged disappears on all but last element
  - Merge HistoryLoader and History widgets?
  - Check functionality of "reset" button
  - Stable configuration when changing time frame (i.e. persist configuration in browser during update of data from YNAB). Picker should store current state in a Storage of some kind and try to merge current state with new state when it is ...re-mounted? Updated?
- Refactor to improve code readability
- Work off transactions?
- Prettier layout of configuration options & chart
- View linear prediction for current month?
- Allow any start and end month

## Cashflow sankey

From https://sankeymatic.com/build/

```
Harry [3000] Regular Income
Louise [2900] Regular Income
Other [260] Regular Income

Regular Income [6020] Expenditure
Savings [480] Expenditure

Regular Income [140] Mortgage

Savings [1700] House Renovation

Investments [590] Savings
Withdrawn Savings [1770] Savings
Savings [180] Owings
```