import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "jalali-moment"; 
import "../../assets/Css/ReservationPage.css";

interface DailyPrice {
  date: string;
  price: number;
}

interface ReservationPageProps {
  selectedRoom?: {
    name: string;
    total_price: number;
    imageUrl: string;
    checkInDate: string;
    nights: number;
    dailyPrices: DailyPrice[];
  };
}

const formatToPersianDate = (date: string): string => {
  return moment(date, "YYYY-MM-DD").locale("fa").format("jYYYY/jMM/jDD dddd");
};

const calculateCheckoutDate = (checkInDate: string, nights: number): string => {
  return moment(checkInDate, "YYYY-MM-DD").add(nights, "days").locale("fa").format("jYYYY/jMM/jDD dddd");
};
const validateIranianNationalId = (nationalId: string): boolean => {
  if (!/^\d{10}$/.test(nationalId)) {
    return false;
  }

  let check = parseInt(nationalId[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(nationalId[i], 10) * (10 - i);
  }

  let remainder = sum % 11;

  if (remainder < 2) {
    return check === remainder;
  } else {
    return check === 11 - remainder;
  }
};
const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
};

const ReservationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedRoom } = location.state || {
    selectedRoom: {
      name: "نام اتاق",
      total_price: 0,
      imageUrl: "",
      checkInDate: "",
      nights: 0,
      dailyPrices: [],
    },
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationalId: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
    nationalId: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {
      name: formData.name === "",
      phone: !validatePhoneNumber(formData.phone), // اعتبارسنجی شماره موبایل
      nationalId: !validateIranianNationalId(formData.nationalId), // اعتبارسنجی کد ملی
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone && !newErrors.nationalId;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      navigate("/reservation/confirmation", {
        state: {
          formData,
          selectedRoom,
        },
      });
    }
  };

  const checkoutDate = calculateCheckoutDate(selectedRoom.checkInDate, selectedRoom.nights);

  return (
    <div className="reservation-page">
      <form className="passenger-form" onSubmit={handleSubmit}>
        <h3 className="form-title">مشخصات رزرو کننده</h3>
        <div className="form-fields">
          {/* Fields for user details */}
          <div className="form-group">
            <label>نام و نام خانوادگی <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "error" : ""}
              placeholder="نام و نام خانوادگی سرپرست اتاق"
            />
            {errors.name && (
              <div className="reserve__validation-error">
                <div className="alert alert-outline-danger">لطفا نام و نام خانوادگی را وارد کنید</div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>کد ملی <span className="required">*</span></label>
            <input
              type="text"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleInputChange}
              className={errors.nationalId ? "error" : ""}
            />
            {errors.nationalId && (
              <div className="reserve__validation-error">
                <div className="alert alert-outline-danger">لطفا کد ملی معتبر وارد کنید</div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>شماره موبایل <span className="required">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? "error" : ""}
              placeholder="09*****8811"
            />
            {errors.phone && (
              <div className="reserve__validation-error">
                <div className="alert alert-outline-danger">لطفا شماره موبایل باید با 09 شروع شود و 11 رقم باشد</div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>ایمیل (اختیاری)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ایمیل خود را وارد نمایید"
            />
          </div>
        </div>
        <button type="submit" className="submit-button">رزرو اتاق</button>
      </form>

      <div className="room-details">
        <h3>{selectedRoom.name}</h3>
        <div className="spacer"></div>
        <div className="date-section">
          <p>تاریخ ورود: <br /><strong>{formatToPersianDate(selectedRoom.checkInDate)} ساعت 14:00</strong></p>
          <p>مدت اقامت: <br /><strong>{selectedRoom.nights} شب ({checkoutDate} ساعت 12:00)</strong></p>
        </div>
        <p>قیمت این هتل برای {selectedRoom.nights} شب: <br /><strong>{selectedRoom.total_price.toLocaleString()} تومان</strong></p>
        <div className="spacer"></div>
        <div className="daily-prices">
          {selectedRoom.dailyPrices.map((daily, index) => (
            <div key={index} className="daily-price-item">
              <span className="daily-price-date">{formatToPersianDate(daily.date)}</span>
              <span className="daily-price-amount">{daily.price.toLocaleString()} تومان</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
