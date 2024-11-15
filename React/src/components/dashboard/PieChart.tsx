// PieChart.tsx
import React from "react";
import ReactApexChart from "react-apexcharts";

interface PieChartProps {}

interface PieChartState {
  series: number[];
  options: ApexCharts.ApexOptions;
}

class PieChart extends React.Component<PieChartProps, PieChartState> {
  constructor(props: PieChartProps) {
    super(props);

    this.state = {
      series: [44, 55, 13, 43, 22],
      options: {
        chart: {
          width: 380,
          type: "pie",
        },
        labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    };
  }

  render() {
    return (
      <div id="pie-chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="pie"
          width={380}
        />
      </div>
    );
  }
}

export default PieChart;
