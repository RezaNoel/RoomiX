import React, { useState, useEffect } from "react";
import styles from "../../../assets/Css/manager/hotel/HotelManagement.module.css";

const HotelManagement: React.FC = () => {
  const [hotelInfo, setHotelInfo] = useState<any>(null);
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone_number: "",
    hotel_type: "",
  });
  const [role, setRole] = useState("");

  useEffect(() => {
    fetchHotelInfo();
  }, []);

  const fetchHotelInfo = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/hotels/hotel-management/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setHotelInfo(data);
        setFormData({
          name: data.name,
          location: data.location,
          phone_number: data.phone_number,
          hotel_type: data.hotel_type,
        });
      } else {
        alert(data.error || "خطا در دریافت اطلاعات هتل.");
      }
    } catch (error) {
      console.error("Error fetching hotel info:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/hotels/hotel-management/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("اطلاعات هتل با موفقیت به‌روزرسانی شد!");
        fetchHotelInfo();
        setEditable(false);
      } else {
        alert(data.error || "خطا در به‌روزرسانی اطلاعات هتل.");
      }
    } catch (error) {
      console.error("Error updating hotel info:", error);
      alert("خطا در به‌روزرسانی اطلاعات هتل.");
    }
  };

  return (
    <div className={styles.hotelManagement}>
      <h2>مدیریت اطلاعات هتل</h2>
      {hotelInfo ? (
        <div className={styles.form}>
          <div>
            <label>نام هتل:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!editable || role !== "admin"}
            />
          </div>
          <div>
            <label>موقعیت:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={!editable || role !== "admin"}
            />
          </div>
          <div>
            <label>شماره تلفن:</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              disabled={!editable}
            />
          </div>
          <div>
            <label>نوع هتل:</label>
            <select
              name="hotel_type"
              value={formData.hotel_type}
              onChange={handleInputChange}
              disabled={!editable || role !== "admin"}
            >
              <option value="apartment_hotel">هتل آپارتمان</option>
              <option value="one_star">هتل 1 ستاره</option>
              <option value="two_star">هتل 2 ستاره</option>
              <option value="three_star">هتل 3 ستاره</option>
              <option value="four_star">هتل 4 ستاره</option>
              <option value="five_star">هتل 5 ستاره</option>
              <option value="eco_lodge">بومگردی</option>
              <option value="boutique_hotel">هتل بوتیک</option>
              <option value="resort">مجتمع تفریحی</option>
              <option value="motel">متل</option>
              <option value="hostel">هاستل</option>
            </select>
          </div>
          <div className={styles.actions}>
            {editable ? (
              <>
                <button onClick={handleUpdate}>ذخیره</button>
                <button onClick={() => setEditable(false)}>لغو</button>
              </>
            ) : (
              <button onClick={() => setEditable(true)}>ویرایش</button>
            )}
          </div>
        </div>
      ) : (
        <p>در حال بارگذاری اطلاعات هتل...</p>
      )}
    </div>
  );
};

export default HotelManagement;
