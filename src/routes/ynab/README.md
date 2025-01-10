
To start Squid:

```shell
# start
sudo squid -k start

# check configuration
sudo squid -k check

# configuration file
/usr/local/etc/squid/squid.conf
```

# Technical notes

The dashboard runs off an array of the following data structure:

 | Key               | Type       | Values | Note |
 |-------------------|------------|--------|------|
 | activity          | float      |        | Used for history & budget |
 | budget            | float      |        | Used for history when averaging over budget; and for budget for scheduled & yearly |
 | timeframe         | enum       | daily/monthly/yearly | |
 | funded_by_savings | boolean    | yes/no | |
 | scheduled         | boolean    | yes/no | |
 | category_id       | identifier |        | |
 | category          | string     |        | |
 | group_id          | identifier |        | |
 | group             | string     |        | |
 | sankey_category   | enum       | ....   | |
 | monthstamp        | integer    |        | |

# To-do's

- Add income in somewhere
- Add "g" and "c" prefixes during data load
- Font size and scale is a mess!
- General caching proxy

## Budget chart:

- Two predictions: what's been budgeted, and what is projected (based on an improved algorithm!)
- Expand top transactions
- Replace %yearly% transactions with the past year's average and make it clear by having a grey bar
    - OR a yearly budget?

## One-off chart

- Re-make using a sparkbar for the whole year

## History chart

- Serious simplification of code needed!
- Add options for averaging. "Average over: timeframe, year, budget, none"
- Profit/loss
  - Sankey:
    - Pull gifts out of "Other", into own category?
    - Testing suite for different situations
  - Revamp monthly profit/loss:
    - Do not stack expenditure & income; just one single bar
    - Add cumulative profit line
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
  - A single, shared configuration for all three charts (income/expenditure/net)
  - Prettier container and layout
  - "Income" and "Expenditure" headings for configuration
  - Stable configuration when changing time frame (i.e. persist configuration in browser during update of data from
  YNAB). Picker should store current state in a Storage of some kind and try to merge current state with new state when it is ...re-mounted? Updated?
- Refactor to improve code readability
  - Pull up loading of data higher up
- Work off transactions?
- View linear prediction for current month?
