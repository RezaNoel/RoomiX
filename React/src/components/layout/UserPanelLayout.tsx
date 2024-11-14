// components/UserPanelLayout.tsx
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const UserPanelLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content">
        <Header  />
        <Outlet /> {/* اینجا محتوای داخلی هر مسیر رندر می‌شود */}
      </div>
    </div>
  );
};

export default UserPanelLayout;
