<script>
    /* To-do:
     *   - Convert to a waterfall chart
     *   - Simplify logic using functions in ynab.js
     */
    import { parseMonth, getMonthFromString, formatZero, noteIsYearly } from "./ynab";

    export let budgets;
    const parsedCategories = budgets.map(budget => {
        const monthString = budget.month.month;  // e.g. "2023-10-01"
        return budget.month.categories
            .map(d => ({...parseMonth(d), month: monthString}))
            // ignore house purchase
            .filter(d => !['House Purchase',].includes(d.category))
    })

    const rows = parsedCategories
      .map(budget =>
        budget
          // only look at categories which are budgeted on a yearly timescale
          .filter((e) => noteIsYearly(e.note))
          // sum up all activity and budget
          .reduce(
            (accumulator, e) => ({
              month: e.month,
              activity: accumulator.activity + e.activity,
              budgeted: accumulator.budgeted + e.budgeted
            }),
            { activity: 0, budgeted: 0 }
          )
      )
      .slice()
      .reverse()
      .reduce((accumulator, budget, index, array) => {
        const cumulativeDebt =
          index == 0 ? 0 : accumulator[index - 1].cumulativeDebt;
        const current = array[index];
        const newDebt = current.activity - current.budgeted;
        return [
          ...accumulator,
          {
            ...current,
            newDebt,
            cumulativeDebt: cumulativeDebt + newDebt
          }
        ];
      }, [])
      .slice()
      .reverse()

    const colour = x => x < 0 ? "var(--pico-color-green-350)" : "var(--pico-color-orange-400)";


</script>

<style>
    table td:nth-child(n+2), table th:nth-child(n+2)  {
        text-align: right;
    }
    table td, table th {
        padding-right: 2px;
        padding-left: 2px;
    }
</style>

<table>
    <tr>
        <th>Month</th>
        <th>Budget</th>
        <th>Unspent</th>
        <th>Balance</th>
    </tr>
    {#each rows as row}
        <tr>
            <td>{getMonthFromString(row.month)}</td>
            <td>{formatZero(row.budgeted)}</td>
            <td style="color: {colour(row.newDebt)}">{formatZero(-row.newDebt)}</td>
            <td style="color: {colour(row.cumulativeDebt)}">{formatZero(-row.cumulativeDebt)}</td>
        </tr>
    {/each}
</table>
