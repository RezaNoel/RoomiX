import React, { useState } from "react";
import RoomForm from "./RoomForm";
import RoomUpdateForm from "./RoomUpdateForm";
import styles from "../../../assets/Css/manager/user/UserManagementTabs.module.css";

const UserManagementTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
  };

  const onRoomUpdated = () => {
        // هر عملیات دیگری که می‌خواهید بعد از به‌روزرسانی اتاق انجام دهید
};


  return (
    <div className={styles.userManagementTabs}>
      <div className={styles.tabHeader}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "create" ? styles.active : ""
          }`}
          onClick={() => handleTabSwitch("create")}
        >
          ایجاد اتاق
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "update" ? styles.active : ""
          }`}
          onClick={() => handleTabSwitch("update")}
        >
          به‌روزرسانی اتاق
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === "create" && <RoomForm onRoomUpdated={onRoomUpdated} />}
        {activeTab === "update" && <RoomUpdateForm onRoomUpdated={onRoomUpdated} />
      }
      </div>
    </div>
  );
};

export default UserManagementTabs;
