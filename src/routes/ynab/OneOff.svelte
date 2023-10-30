<svelte:head>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@picocss/pico@next/css/pico.colors.min.css"
    />
</svelte:head>

<script>
    import * as d3 from 'd3';

    import { parseMonth } from "./ynab";

    export let budgets;
    const parsedCategories = budgets.map(budget => {
        const monthString = budget.month.month;  // e.g. "2023-10-01"
        return budget.month.categories.map(d => ({
            ...parseMonth(d),
            month: monthString
        }))
    })

    const rows = parsedCategories
      .map(budget =>
        budget
          // only look at categories in the "One-Off" group
          .filter((e) => e.group === "One-Off")
          // sum up all activity and budget for this group
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

    const format = x => d3.format(",.2r")(Math.round(x / 10) * 10)
    const formatZero = x => x == 0 ? "-" : format(x);
    const colour = x => x < 0 ? "var(--pico-color-green-350)" : "var(--pico-color-orange-400)";
    const getMonthFromString = monthString => {
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const date = new Date(monthString);
          const monthIndex = date.getMonth();
          return months[monthIndex];
    }

</script>

<style>
    table td:nth-child(n+2), table th:nth-child(n+2)  {
        text-align: right;
    }
</style>

<table>
    <tr>
        <th>Month</th>
        <th>Budgeted</th>
        <th>Excess</th>
        <th>Cumulative</th>
    </tr>
    {#each rows as row}
        <tr>
            <td>{getMonthFromString(row.month)}</td>
            <td>{formatZero(row.budgeted)}</td>
            <td style="color: {colour(row.newDebt)}">{formatZero(row.newDebt)}</td>
            <td style="color: {colour(row.cumulativeDebt)}">{formatZero(row.cumulativeDebt)}</td>
        </tr>
    {/each}
</table>
