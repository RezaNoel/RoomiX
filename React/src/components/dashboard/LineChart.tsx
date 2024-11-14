import React from "react";
import ReactApexChart from "react-apexcharts";

interface LineChartProps {}

interface LineChartState {
  series: {
    name: string;
    data: number[];
  }[];
  options: ApexCharts.ApexOptions;
  isBlurred: boolean; // اضافه‌شده برای کنترل تار شدن
}

const API = {
  data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 12, 19, 20],
  month: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
};

class LineChart extends React.Component<LineChartProps, LineChartState> {
  constructor(props: LineChartProps) {
    super(props);

    this.state = {
      series: [
        {
          name: "Desktops",
          data: API.data,
        },
      ],
      options: {
        chart: {
          height: 350,
          type: "line",
          zoom: {
            enabled: false,
          },
          animations: {
            enabled: false, // غیرفعال کردن انیمیشن‌ها
          },
          toolbar: {
            show: false, // غیرفعال کردن تولبار
          },
        },
        tooltip: {
          enabled: false, // غیرفعال کردن نمایش اطلاعات هنگام موس‌اور
        },
        dataLabels: {
          enabled: false, // غیرفعال کردن نمایش مقادیر روی نقاط
        },
        stroke: {
          curve: "straight",
        },
        title: {
          text: "نمودار فروش ماهیانه",
          align: "left",
          style: {
            fontSize: "20px",
            fontFamily: "Vazirmatn, sans-serif",
            color: "#333",
          },
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"],
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: API.month,
          labels: {
            style: {
              fontSize: "14px",
              fontFamily: "Vazirmatn, sans-serif",
            },
          },
        },
      },
      isBlurred: false, // مقدار اولیه
    };
  }

  render() {
    return (
      <div style={{ position: "relative", width: "100%", height: "350px" }}>
        {/* متن به زودی */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "32px",
            fontWeight: "bold",
            color: "#666",
            pointerEvents: "none", // جلوگیری از تعامل کاربر با متن
          }}
        >
          ...به زودی
        </div>

        {/* نمودار */}
        <div id="line-chart">
          <ReactApexChart
            options={this.state.options}
            series={this.state.series}
            type="line"
            height={350}
          />
        </div>
      </div>
    );
  }
}

export default LineChart;
