import React, { useEffect, useState } from "react";
import RoomList from "./RoomList";
import UserForm from "./UserForm";
import styles from "../../../assets/Css/manager/user/UserManagement.module.css";
import RoomManagementTabs from "./RoomManagementTabs";

// تابع برای دریافت کوکی‌ها
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);

  // گرفتن آیدی هتل از کوکی
  const profileInfoString = getCookie("profile_info");
  const hotelIdentifier = profileInfoString
    ? JSON.parse(profileInfoString)?.hotel?.id
    : null;

  useEffect(() => {
    if (hotelIdentifier) {
      fetchUsers();
    } else {
      console.error("Hotel identifier is missing");
    }
  }, [refresh, hotelIdentifier]);

  const fetchUsers = async () => {
    try {
      if (!hotelIdentifier) {
        console.error("Hotel identifier is missing");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/user_management/hotel-users/${hotelIdentifier}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleUserCreated = () => {
    setRefresh(!refresh);
  };

  return (
    <div className={styles.container}>
      <h1>مدیریت اتاق ها</h1>

      <RoomManagementTabs  />
      <RoomList  />
    </div>
  );
};

export default UserManagement;
