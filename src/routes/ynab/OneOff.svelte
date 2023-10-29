<script>
    import * as d3 from 'd3';

    import { parseMonth } from "./ynab";

    export let budgets;
    const parsedCategories = budgets.map(budget => budget.month.categories
        .map(parseMonth)
    )

    const filteredBudgets = budgets.map((budget_) => {
      // exclude some categories
      return budget_
        .map((category) => ({
          // move "uncategorized" into the "regular" group
          ...category,
          group: category.category == "Uncategorized" ? "Regular" : category.group
        }))
        .filter(
          (category) =>
            !(
              //category.obj.hidden |
              (
                category.obj.deleted |
                (category.group == "Internal Master Category") |
                (category.category == "Forex") |
                (category.category == "Off The Books")
              )
            )
        );
    })

    const oneOffData = filteredBudgets
      .map((budget) =>
        budget
          // only look at categories in the "One-Off" group
          .filter((e) => e.group === "One-Off")
          // sum up all activity and budget for this group
          .reduce(
            (accumulator, e) => ({
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

</script>
