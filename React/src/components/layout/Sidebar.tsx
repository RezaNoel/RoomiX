import React, { useEffect, useState } from "react";
import SidebarItem from "./SidebarItem";
import { NavLink, useLocation } from "react-router-dom";
import { FaHome, FaTable, FaTicketAlt, FaBusinessTime, FaUserTie } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

interface SidebarItemProps {
  name: string;
  icon: JSX.Element;
  link?: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { token } = useAuth(); // دریافت توکن از کانتکست
  const [hotelName, setHotelName] = useState<string>("در حال بارگذاری...");
  const [hotelType, setHotelType] = useState<string>("نوع هتل مشخص نشده");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:8000/api/user_management/user-profile/", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user info");
          }

          const data = await response.json();
          setUserRole(data.role || "");
          setHotelName(data.hotel?.name || "هتلی مشخص نشده");
          setHotelType(data.hotel?.type || "نوع هتل مشخص نشده");
        } catch (error) {
          console.error("Error fetching user info:", error);
          setHotelName("خطا در دریافت اطلاعات کاربر");
        }
      } else {
        setHotelName("توکن احراز هویت یافت نشد");
      }
    };

    fetchUserInfo();
  }, [token]);

  const items: SidebarItemProps[] = [
    { name: "پیشخان", icon: <FaHome />, link: "/" },
    { name: "رزرواسیون", icon: <FaTicketAlt />, link: "/reservations" },
    { name: "CRM", icon: <FaTable />, link: "/crm" },
    { name: "به زودی...", icon: <FaBusinessTime /> },
  ];

  // اضافه کردن آیتم مدیریت تنها برای مدیران
  if (userRole === "ادمین" || userRole === "مدیر هتل") {
    items.splice(1, 0, { name: "مدیریت", icon: <FaUserTie />, link: "/manager" });
  }

  return (
    <div className="sidebar">
      <h2>
        {hotelType} {hotelName}
      </h2>

      <div>
        {items.map((item) => (
          <NavLink
            to={item.link || "#"}
            key={item.name}
            style={{ textDecoration: "none" }}
          >
            <SidebarItem
              name={item.name}
              icon={item.icon}
              selected={currentPath === item.link}
            />
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
