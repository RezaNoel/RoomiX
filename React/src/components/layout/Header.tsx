import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaUserCircle, FaCog } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../assets/Css/Header.css";

const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // تابع برای تبدیل مسیر به نام خوانا
  const getCurrentPathName = () => {
    switch (location.pathname) {
      case "/crm":
        return "CRM";
      case "/manager":
        return "مدیریت";
      case "/dashboard":
      case "/":
        return "پیشخان";
      case "/reservations":
        return "رزرواسیون";
      case "/hr":
        return "منابع انسانی";
      default:
        return "صفحه‌نامشخص";
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false); // بستن منوی نوتیفیکیشن هنگام باز کردن پروفایل
    setIsSettingsOpen(false); // بستن منوی تنظیمات هنگام باز کردن پروفایل
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false); // بستن منوی پروفایل هنگام باز کردن نوتیفیکیشن
    setIsSettingsOpen(false); // بستن منوی تنظیمات هنگام باز کردن نوتیفیکیشن
  };

  const toggleSettingsDropdown = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setIsProfileOpen(false); // بستن منوی پروفایل هنگام باز کردن تنظیمات
    setIsNotificationsOpen(false); // بستن منوی نوتیفیکیشن هنگام باز کردن تنظیمات
  };

  const handleLogout = () => {
    logout(); // حذف توکن و پاکسازی وضعیت ورود
    navigate("/login"); // انتقال کاربر به صفحه لاگین
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      profileRef.current && !profileRef.current.contains(event.target as Node) &&
      notificationsRef.current && !notificationsRef.current.contains(event.target as Node) &&
      settingsRef.current && !settingsRef.current.contains(event.target as Node)
    ) {
      setIsProfileOpen(false);
      setIsNotificationsOpen(false);
      setIsSettingsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header-container">
      {/* نمایش مسیر فعلی */}
      <div className="path-display">
        <span>{getCurrentPathName()}</span>
      </div>

      {/* جعبه جستجو */}
      <div className="search">
        <input type="text" placeholder="Search" />
      </div>

      {/* آیکون‌ها */}
      <div className="header-icons">
        {/* نوتیفیکیشن */}
        <div className="notification-icon" ref={notificationsRef}>
          <FaBell onClick={toggleNotificationsDropdown} size={20} />
          {isNotificationsOpen && (
            <div className="dropdown notifications-dropdown">
              <p>نوتیفیکیشن جدیدی نیست</p>
            </div>
          )}
        </div>

        {/* پروفایل کاربر */}
        <div className="profile-icon" ref={profileRef}>
          <FaUserCircle onClick={toggleProfileDropdown} size={24} />
          {isProfileOpen && (
            <div className="dropdown profile-dropdown">
              <p>پروفایل کاربر (به زودی)</p>
              <p>تنظیمات (به زودی)</p>
              <p onClick={handleLogout} style={{ cursor: "pointer" }}>خروج</p> {/* اضافه کردن عملکرد خروج */}
            </div>
          )}
        </div>

        {/* تنظیمات */}
        <div className="settings-icon" ref={settingsRef}>
          <FaCog onClick={toggleSettingsDropdown} size={20} />
          {isSettingsOpen && (
            <div className="dropdown settings-dropdown">
              <p>تنظیمات (به زودی)</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
