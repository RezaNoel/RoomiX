import React from "react";
import "../../assets/Css/App.css";
import CustomerTable from "./CustomerTable";

function App() {
  
  return (
    <div className="app-container">
      <div className="main-content">
        <div className="content-wrapper">
        <CustomerTable />
        </div>
      </div>
      
    </div>
  );
}

export default App;
