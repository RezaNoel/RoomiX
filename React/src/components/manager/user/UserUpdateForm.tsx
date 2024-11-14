import React, { useState } from "react";
import styles from "../../../assets/Css/manager/user/userUpdateForm.module.css";

interface UserUpdateFormProps {
  onUserUpdated: () => void;
}

const UserUpdateForm: React.FC<UserUpdateFormProps> = ({ onUserUpdated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [credit, setCredit] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      username,
    };

    // Add only fields that are filled
    if (password) payload.password = password;
    if (firstName) payload.first_name = firstName;
    if (lastName) payload.last_name = lastName;
    if (role) payload.role = role;
    if (credit) payload.credit = parseFloat(credit);

    try {
      const response = await fetch("http://localhost:8000/api/user_management/user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("کاربر با موفقیت به‌روزرسانی شد!");
        onUserUpdated();
        setUsername("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setRole("");
        setCredit("");
      } else {
        const errorData = await response.json();
        alert(`خطا در به‌روزرسانی کاربر: ${errorData.error || "نامشخص"}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("خطا در به‌روزرسانی کاربر.");
    }
  };

  return (
    <form className={styles.userUpdateForm} onSubmit={handleSubmit}>
      <h2>به‌روزرسانی کاربر</h2>
      <div className={styles.inputs}>
        <input
          type="text"
          placeholder="نام کاربری (اجباری)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
         <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">انتخاب نقش</option>
          <option value="reservation">رزرواسیون</option>
          <option value="accounting">حسابدار</option>
          <option value="housekeeping">خانه دار</option>
          <option value="travelagency">آژانس هواپیمایی</option>
        </select>
        <input
          type="text"
          placeholder="نام"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="نام خانوادگی"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
       
        <input
          type="number"
          placeholder="اعتبار"
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
        />
      </div>
      <button type="submit">به‌روزرسانی</button>
    </form>
  );
};

export default UserUpdateForm;
