# To-do's

- Add income in somewhere
- Add "g" and "c" prefixes during data load
- Font size and scale is a mess!
- General caching proxy

## Budget chart:

- Better handle yearly/monthly:
  - Put all yearly and all montly categories into one group? Then maybe do not have a group total otherwise.
  - OR optional expansion of any group?
- Prettify the "Estimated spend at end of month" and maybe add a Euro symbol
- Have an option at the top to toggle between sparkbar view (as it is now) and "table" view, where there would be entries for: total remaining in month, average remaining per day, etc.
- Expand top transactions
- Go to earlier month
- Improve linear prediction

## One-off chart

- General improvement!

## History chart

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
  - Allow any start and end month
  - Picker should store current state in a Storage of some kind and try to merge current state with new state
    when it is ...re-mounted? Updated?
- Refactor to improve code readabilit
- Add income
- Work off transactions?
- Optionally include owings and mortgage amortisation
- Prettier layout of configuration options & chart
- Clearer language between "previous year" and "last 12 months" etc.
- Stable configuration when changing time frame (i.e. persist configuration in browser during update of data from YNAB).
- View linear prediction for current month?
