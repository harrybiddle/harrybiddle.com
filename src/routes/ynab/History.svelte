<script>
    /* TODO:
     *  - Add average
     *  - Transpose is nooot working at all - another way to do this?
     *  - Average out One-Off category group over whole range
     */
    import * as d3 from "d3"

    import { processBudget, getMonthFromString, formatZero } from "./ynab";
    export let budgets;

    const columns = budgets.map(budget => processBudget(budget).map(row => ({...row, month: budget.month.month})));
    const rows = d3.transpose(columns);

    console.log(rows[0]);

</script>

<style>
    table td:nth-child(n+2), table th:nth-child(n+2)  {
        text-align: right;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      left: 0;
      z-index: 1;
    }

    th:first-child, td:first-child {
      position: sticky;
      left: 0;
      z-index: 1;
      background: white;
    }

    table tr td:first-child {
        /* category name */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 120px;
        text-transform: none;
    }
</style>

<div style="overflow-x: auto;">
    <table>
        <tr>
            <th></th>
            {#each rows[0] as cell}
                <th>{getMonthFromString(cell.month)}</th>
            {/each}
        </tr>
        {#each rows as columns}
        {@const fontWeight = columns[0].level > 0 ? "bold" : "normal"}
            <tr style="
                border-bottom: 1px solid {columns[0].level > 1 ? 'black' : 'transparent'};
                text-transform: {columns[0].level > 1 ? 'uppercase' : 'none'};
                background: {columns[0].level > 1 ? 'WhiteSmoke' : 'transparent'}!important;
            ">
                <td style="font-weight: {fontWeight}">{columns[0].name}</td>
                {#each columns as cell}
                    <td style="font-weight: {fontWeight}">{formatZero(cell.activity)}</td>
                {/each}
            </tr>
        {/each}
    </table>
</div>
