import React, { useState } from "react";
import UserForm from "./UserForm";
import UserUpdateForm from "./UserUpdateForm";
import styles from "../../../assets/Css/manager/user/UserManagementTabs.module.css";

const UserManagementTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("create");

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
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
          ایجاد کاربر
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "update" ? styles.active : ""
          }`}
          onClick={() => handleTabSwitch("update")}
        >
          به‌روزرسانی کاربر
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === "create" && <UserForm onUserCreated={() => alert("کاربر با موفقیت ایجاد شد!")} />}
        {activeTab === "update" && <UserUpdateForm onUserUpdated={() => alert("کاربر با موفقیت به‌روزرسانی شد!")} />}
      </div>
    </div>
  );
};

export default UserManagementTabs;
