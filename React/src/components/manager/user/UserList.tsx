import React from "react";
import moment from "jalali-moment"; // اضافه کردن کتابخانه برای تبدیل تاریخ
import styles from "../../../assets/Css/manager/user/UserList.module.css";

interface User {
  name: string;
  username: string;
  role: string;
  credit: number;
  last_login: string;
}

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className={styles.userList}>
      {users.length === 0 ? (
        <p>کاربری یافت نشد.</p>
      ) : (
        users.map((user, index) => (
          <div key={index} className={styles.userRow}>
            <p>
              <strong>نام:</strong> {user.name}
            </p>
            <p>
              <strong>نام کاربری:</strong> {user.username}
            </p>
            <p>
              <strong>نقش:</strong> {user.role}
            </p>
            <p>
              <strong>اعتبار:</strong> {user.credit.toLocaleString()}
            </p>
            <p>
              <strong>آخرین ورود:</strong>{" "}
              {user.last_login
                ? moment(user.last_login).locale("fa").format("jYYYY/jMM/jDD - HH:mm:ss")
                : "نامشخص"}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default UserList;
