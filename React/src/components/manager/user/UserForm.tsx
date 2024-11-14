import React, { useState } from "react";
import styles from "../../../assets/Css/manager/user/UserForm.module.css";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

interface UserFormProps {
  onUserCreated: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reservation");
  const [credit, setCredit] = useState("");

  const profileInfoString = getCookie("profile_info");
  const hotelId = profileInfoString ? JSON.parse(profileInfoString)?.hotel?.id : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      username,
      first_name: firstName,
      last_name: lastName,
      password,
      role,
      hotel_id: hotelId,
    };

    if (role === "reservation" || role === "travelagency") {
      payload.credit = parseFloat(credit);
    }

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
        alert("کاربر با موفقیت ایجاد شد!");
        onUserCreated();
        setUsername("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setRole("reservation");
        setCredit("");
      } else {
        const errorData = await response.json();
        alert(`خطا در ایجاد کاربر: ${errorData.error || "نامشخص"}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("خطا در ایجاد کاربر.");
    }
  };

  return (
    <form className={styles.userForm} onSubmit={handleSubmit}>
      <h2>ایجاد کاربر</h2>
      <div className={styles.inputs}>
      <input
          type="text"
          placeholder="نام کاربری"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
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
          required
        />
        <input
          type="text"
          placeholder="نام خانوادگی"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        
        <input
          type="number"
          placeholder="اعتبار"
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
          disabled={!(role === "reservation" || role === "travelagency")}
        />
      </div>
      <button type="submit">ایجاد</button>
    </form>
  );
};

export default UserForm;
