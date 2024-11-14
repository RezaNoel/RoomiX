import React, { useEffect, useState } from "react";
import RoomCard from "./RoomCard";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useNavigate } from "react-router-dom";
import "../../assets/Css/CustomerReservationSystem.css";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const CustomerReservationSystem: React.FC = () => {
  interface Room {
    id: number;
    name_fa: string;
    image: string;
    base_price: number;
    discount_percentage: number;
    calculated_price: number;
    total_price: number;
    daily_prices: { date: string; price: number }[];
  }
  
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [nights, setNights] = useState<number>(1);
  const [showAlert, setShowAlert] = useState<boolean>(false); // حالت نمایش پیام هشدار
  const navigate = useNavigate();

  // بررسی توکن
  const isTokenValid = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      return Date.now() < exp * 1000; // بررسی تاریخ انقضا
    } catch (error) {
      return false;
    }
  };

  const handleLoginClick = () => {
    navigate(`/login?redirect=/reservation`);
  };
  

  const fetchRooms = async () => {
    if (!isTokenValid()) {
      setShowAlert(true); // نمایش پیام هشدار اگر توکن معتبر نبود
      return;
    }

    if (!selectedDate) {
      console.error("Check-in date is required");
      return;
    }

    const profileInfoString = getCookie("profile_info");
    const hotelIdentifier = profileInfoString ? JSON.parse(profileInfoString)?.hotel?.id : null;

    if (!hotelIdentifier) {
      console.error("Hotel ID is required");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("User is not authenticated");
      return;
    }

    try {
      const gregorianDate = selectedDate
        .convert(gregorian)
        .format("YYYY-MM-DD")
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());

      const response = await fetch(
        `http://localhost:8000/api/available-rooms/?check_in=${gregorianDate}&number_of_nights=${nights}&hotel_id=${hotelIdentifier}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const formattedRooms = data.map((item: any) => ({
        id: item.room.id,
        name_fa: item.room.name_fa,
        image: item.room.image,
        base_price: Number(item.room.base_price),
        discount_percentage: Number(item.room.discount_percentage),
        calculated_price: Number(item.room.calculated_price),
        total_price: item.total_price,
        daily_prices: item.daily_prices,
      }));

      setRooms(formattedRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="reservation-container">
      {/* پیام هشدار */}
      {showAlert && (
        <div className="alert-overlay">
          <div className="alert-box">
            <p>ابتدا وارد شوید</p>
            <button onClick={() => setShowAlert(false)}>متوجه شدم</button>
          </div>
        </div>
      )}

      <div className="search-box">
        <div className="input-group">
          <label>تاریخ ورود:</label>
          <DatePicker
            value={selectedDate}
            onChange={(date) =>
              setSelectedDate(new DateObject(date).convert(persian))
            }
            calendar={persian}
            locale={persian_fa}
            className="date-picker"
            inputClass="select-date"
            minDate={new DateObject().convert(persian)}
          />
        </div>
        <div className="input-group">
          <label>تعداد شب‌:</label>
          <select
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="night-selector"
            
          >
            {[...Array(8)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} شب
              </option>
            ))}
          </select>
        </div>
        <button className="search-button" onClick={fetchRooms}>
          جستجو
        </button>
        {!isTokenValid() && (
          <button className="login-button" onClick={handleLoginClick}>
            ورود
          </button>
        )}
      </div>

      <div className="rooms-section">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            name={room.name_fa}
            imageUrl={room.image}
            total_price={room.total_price}
            discountPercentage={room.discount_percentage}
            originalPrice={room.base_price}
            dailyPrices={room.daily_prices}
            discountedPrice={0}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomerReservationSystem;
