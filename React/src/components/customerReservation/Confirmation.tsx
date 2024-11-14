import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "jalali-moment";
import "../../assets/Css/Confirmation.css";

// تابع برای تبدیل تاریخ به شمسی
const formatToPersianDate = (date: string): string => {
  return moment(date, "YYYY-MM-DD").locale("fa").format("jYYYY/jMM/jDD dddd");
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// تابع برای محاسبه تاریخ خروج
const calculateCheckoutDate = (checkInDate: string, nights: number): string => {
  return moment(checkInDate, "YYYY-MM-DD")
    .add(nights, "days")
    .locale("fa")
    .format("jYYYY/jMM/jDD dddd");
};

// تابع برای بررسی اعتبار توکن
const isTokenValid = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return Date.now() < exp * 1000; // بررسی تاریخ انقضا
  } catch (error) {
    return false;
  }
};

const Confirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, selectedRoom } = location.state || {};

  // حالت‌ها
  const [hasValidToken, setHasValidToken] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  useEffect(() => {
    setHasValidToken(isTokenValid());
  }, []);

  if (!formData || !selectedRoom) {
    return <p>اطلاعاتی یافت نشد. لطفاً دوباره تلاش کنید.</p>;
  }

  // محاسبه تاریخ خروج بر اساس تعداد شب‌ها
  const checkoutDate = calculateCheckoutDate(
    selectedRoom.checkInDate,
    selectedRoom.nights
  );

  const createReservation = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("توکن یافت نشد. لطفاً وارد حساب کاربری شوید.");
      return null; // تغییر به null برای مدیریت صحیح خطاها
    }

    const profileInfoString = getCookie("profile_info");
    const profileInfo = profileInfoString ? JSON.parse(profileInfoString) : null;
    const hotelIdentifier = profileInfo?.hotel?.id || null;
    const userRole = profileInfo?.role || "reservation"; // نقش کاربر پیش‌فرض "reservation"

    // تعیین روش پرداخت بر اساس نقش کاربر
    let paymentMethod = selectedPaymentMethod; // مقدار اولیه از گزینه انتخاب شده
    if (userRole === "رزرواسیون") {
      paymentMethod = "reservation";
    } else if (userRole === "آژانس هواپیمایی") {
      paymentMethod = "travelagency";
    }

    // تبدیل تاریخ‌های شمسی به میلادی
    const checkOutDateGregorian = moment(
      calculateCheckoutDate(selectedRoom.checkInDate, selectedRoom.nights),
      "jYYYY/jMM/jDD"
    ).format("YYYY-MM-DD");

    const reservationData = {
      full_name: formData.name,
      nid: formData.nationalId,
      emergency_contact: formData.phone,
      email: formData.email,
      hotel_id: hotelIdentifier,
      room_name: selectedRoom.name,
      check_in: selectedRoom.checkInDate,
      check_out: checkOutDateGregorian,
      total_price: selectedRoom.total_price,
      payment_method: paymentMethod,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/api/hotel_crm/create-reservation/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reservationData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.reservation_id; // بازگرداندن ID رزرو
      } else {
        const errorData = await response.json();
        alert(`خطا: ${errorData.error}`);
        return null;
      }
    } catch (error) {
      alert("مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
      return null;
    }
  };

  const deductCredit = async (amount: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("توکن یافت نشد. لطفاً وارد حساب کاربری شوید.");
      return false;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/user_management/deduct-credit/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        alert(`خطا: ${errorData.error}`);
        return false;
      }
    } catch (error) {
      alert("مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
      return false;
    }
  };

  const handlePayment = async () => {
    const isCreditPayment = selectedPaymentMethod === "credit";
    let reservationId = null;
  
    if (isCreditPayment) {
      const success = await deductCredit(selectedRoom.total_price);
      if (success) {
        reservationId = await createReservation();
      }
    } else {
      reservationId = await createReservation();
    }
  
    if (reservationId) {
      const token = localStorage.getItem("token"); // دریافت توکن
      if (!token) {
        alert("توکن یافت نشد. لطفاً وارد حساب کاربری شوید.");
        return;
      }
  
      try {
        const response = await fetch(
          `http://localhost:8000/api/reservation-detail/${reservationId}/`,
          {
            method: "GET", // درخواست GET
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ارسال توکن برای وریفای
            },
          }
        );
  
        if (response.ok) {
          const reservationData = await response.json();
          navigate("/voucher", {
            state: {
              reserve: {
                reserve_code: reservationData.reservation_id,
                reserve_date_shamsi: reservationData.reservation_date,
                hotel_name: reservationData.hotel_name,
                hotel_type: reservationData.hotel_type,
                hotel_address: reservationData.hotel_address,
                room_name: reservationData.room_name,
                check_in: formatToPersianDate(selectedRoom.checkInDate),
                check_out: checkoutDate,
                calculate_stay_days: selectedRoom.nights,
                price: reservationData.price
              },
              fullname: formData.name,
              phone: formData.phone,
            },
          });
        } else {
          const errorData = await response.json();
          alert(`خطا در بازیابی اطلاعات واچر: ${errorData.error}`);
        }
      } catch (error) {
        alert("مشکلی در بازیابی اطلاعات واچر پیش آمد. لطفاً دوباره تلاش کنید.");
      }
    } else {
      alert("خطایی در ایجاد رزرو رخ داده است.");
    }
  };
  

  return (
    <div className="confirmation-page">
      <h3>تایید رزرو</h3>
      <div className="reservation-summary">
        <p><strong>نام رزرو کننده:</strong> {formData.name}</p>
        <p><strong>کد ملی:</strong> {formData.nationalId}</p>
        <p><strong>شماره موبایل:</strong> {formData.phone}</p>
        {formData.email && <p><strong>ایمیل:</strong> {formData.email}</p>}

        <h4>اطلاعات اتاق</h4>
        <p><strong>نام اتاق:</strong> {selectedRoom.name}</p>
        <p><strong>تاریخ ورود:</strong> {formatToPersianDate(selectedRoom.checkInDate)} ساعت 14:00</p>
        <p><strong>تاریخ خروج:</strong> {checkoutDate} ساعت 12:00</p>
        <p><strong>تعداد شب اقامت:</strong> {selectedRoom.nights} شب</p>
        <p><strong>قیمت کل:</strong> {selectedRoom.total_price.toLocaleString()} تومان</p>

        <div className="payment-option">
          <label
            className={`credit-payment ${!hasValidToken ? "disabled" : ""}`}
            title={!hasValidToken ? "برای خرید اعتباری باید وارد شوید" : ""}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="credit"
              onChange={() => setSelectedPaymentMethod("credit")}
              disabled={!hasValidToken}
            /> پرداخت اعتباری
          </label>
        </div>

        <button
          onClick={handlePayment}
          className="pay-button"
          disabled={!selectedPaymentMethod}
        >
          پرداخت
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
