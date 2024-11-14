import React from "react";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import '../../assets/Css/Chart.css'

const Charts: React.FC = () => {
  return (
    <div className="chart-container">
      <div className="chart-item">
        <LineChart />
      </div>
      {/* <div className="chart-item">
        <PieChart />
      </div> */}
    </div>
  );
};

export default Charts;
