<script>
    import * as d3 from 'd3'
    import { sankey as d3Sankey } from 'd3-sankey';
    import * as Plot from '@observablehq/plot';

    import PlotContainer from "../../lib/PlotContainer.svelte";
    import { format } from "./ynab";

    export let data;
    export let months;

    const width =  100;
    const height = 100;

    function process(data) {

       // --------------------------------------------------------------------------- //
       const groupFilters = {
            Investment: d => d.group === "Investments",
            Mortgage: d => d.group === "Mortgage",
            HouseRenovation: d => d.group === "House Renovation",
            Owings: d => d.group === "Owings",
        };
        const isNoneOfTheAbove = d => !Object.values(groupFilters).some(filter => filter(d));

        const investment = data.filter(groupFilters.Investment);
        const mortgage = data.filter(groupFilters.Mortgage);
        const houseRenovation = data.filter(groupFilters.HouseRenovation);
        const owings = data.filter(groupFilters.Owings);
        const noneOfTheAbove = data.filter(isNoneOfTheAbove);
        const expenditure = noneOfTheAbove.filter(d => d.activity < 0);
        const regularIncome = noneOfTheAbove.filter(d => d.activity >= 0);

        const totalExpenditure = d3.sum(expenditure, d => -d.activity);
        const totalRegularIncome = d3.sum(regularIncome, d => d.activity);
        const totalMortgage = d3.sum(mortgage, d => -d.activity);
        const totalOwings = d3.sum(owings, d => -d.activity);

        const incomeAvailable = totalRegularIncome - totalMortgage - totalOwings;
        const expenditureFinancedByIncome = Math.min(incomeAvailable, totalExpenditure);
        const expenditureFinancedBySavings = totalExpenditure - expenditureFinancedByIncome;

        const total = d3.sum(data, d => d.activity);

        const reservoir = "Investments & Savings";
        const regular = "Primary Income";

        const links = [
            // -----------------------------------------------------------------
            // flows to regular income
            // -----------------------------------------------------------------
            ...regularIncome.map(d => [d.name, d.activity, regular]),
            // -----------------------------------------------------------------
            // flows out from regular income
            // -----------------------------------------------------------------
            // regular income -> mortgage
            ...mortgage.map(d => [regular, -d.activity, d.name]),
            // regular income -> owings
            ...owings.map(d => [regular, -d.activity, d.name]),
            // regular income -> expenditure
            [regular, expenditureFinancedByIncome, "Expenditure"],
            // regular income -> savings
            [regular, incomeAvailable - expenditureFinancedByIncome, reservoir],
            // -----------------------------------------------------------------
            // flows to savings
            // -----------------------------------------------------------------
            // investments -> savings
            ...investment.map(d => [d.name, d.activity, reservoir]),
            // withdrawn from savings
            ["Savings Withdrawn", -total, reservoir],
            // -----------------------------------------------------------------
            // flows out from savings
            // -----------------------------------------------------------------
            // savings -> renovation
            ...houseRenovation.map(d => [reservoir, -d.activity, d.name]),
            // savings -> expenditure
            [reservoir, expenditureFinancedBySavings, "Expenditure"],
       ]
       // remove zero flows
       .filter(([source, amount, target]) => Math.abs(amount) > 0)
       // swap source and target for negative flows
       .map(
        ([source, amount, target]) => {
            if (amount < 0) return ({source: target, target: source, value: amount})
            else return ({source, target, value: amount})
        }
       );
       const nodeNames = [...(new Set(links.map(d => d.source))).union(new Set(links.map(d => d.target)))]


       const f = x => d3.format('.2r')(Math.round(x / 10) * 10);
       const sankeyData = ({
        nodes: nodeNames.map(name => ({node: nodeNames.indexOf(name), name: name})),
        links: links.map(link => ({
            source: nodeNames.indexOf(link.source),
            target: nodeNames.indexOf(link.target),
            value: link.value,
        }))
       })

       d3Sankey
        .nodeWidth(20)
        .nodePadding(height / sankeyData.nodes.length)
        .size([width, height])(sankeyData);

    const sankeyLinks = sankeyData.links.map((l) => [
        { x: l.source.x1, y0: l.y0 + l.width / 2, y1: l.y0 - l.width / 2 },
        { x: l.target.x0, y0: l.y1 + l.width / 2, y1: l.y1 - l.width / 2 }
    ]);

       return ({sankeyData, links: sankeyLinks});

    }
</script>


{#if data.length > 0}
{@const processedData = process(data) }
    <PlotContainer
        options={{
            x: { axis: null },
            y: { axis: null },
            width: width,
            height: height,
            marginTop: 20,
            marginRight: 120,
            marks: [
                processedData.links.map((link) =>
                Plot.areaY(link, {
                    x: "x",
                    y1: "y0",
                    y2: "y1",
                    curve: "bump-x",
                    fill: "#000",
                    fillOpacity: 0.1,
                    order: "value"
                })
                ),
                Plot.rect(processedData.sankeyData.nodes, {
                x1: "x0",
                x2: "x1",
                y1: "y0",
                y2: "y1",
                fill: "name"
                }),
                Plot.text(processedData.sankeyData.nodes, {
                x: "x1",
                dx: 5,
                y: (d) => (d.y1 + d.y0) / 2,
                text: "name",
                textAnchor: "start"
                })
            ],
        }}
    />
{:else}
    (No data to show)
{/if}