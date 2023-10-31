<script>
    /* TODO:
     *  - Add average
     *  - Transpose is nooot working at all - another way to do this?
     *  - Average out One-Off category group over whole range
     *  - Stacked bar chart?
     */
    import * as d3 from "d3"
    import { onMount } from 'svelte';

    import { parseBudget, sumBudgets, humanMonth } from "./ynab";
    export let budgets;

    const categories = budgets.reduce(
        (accumulator, budget) => [...accumulator, ...parseBudget(budget)],
        []
    )
    // TODO: only run sum for groups?
    const summary = sumBudgets(categories).filter(d => d.level === 1);
    console.log(summary);



  const data = summary.map(
      d => ({
          category: humanMonth(d.month),
          values: [10, 20, 30]
      })
  )

  onMount(() => {
    // Your D3 code for creating the stacked bar chart
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(d.values))])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll('g')
      .data(data)
      .enter().append('g')
      .attr('fill', d => color(d.category))
      .selectAll('rect')
      .data(d => d.values)
      .enter().append('rect')
      .attr('x', (d, i) => xScale(data[i].category))
      .attr('y', d => yScale(d))
      .attr('height', d => yScale(0) - yScale(d))
      .attr('width', xScale.bandwidth());
  });
</script>

<div id="chart"></div>

<style>
  /* Add CSS styles for your chart here */
</style>
