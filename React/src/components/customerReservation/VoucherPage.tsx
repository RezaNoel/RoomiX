import React, { useEffect, useState } from "react";
import styles from "../../assets/Css/Voucher.module.css";
import { useLocation } from "react-router-dom";

interface Room {
  faname: string;
  hotel: string;
  price: number;
}

interface Reserve {
  reserve_code: string;
  reserve_date_shamsi: string;
  enter: string;
  exit: string;
  calculate_stay_days: number;
  room: Room;
  needs: string;
}

const formatPrice = (price: number): string => price.toLocaleString();

const VoucherPage: React.FC = () => {
  const location = useLocation();
  const { reserve, fullname, phone } = location.state || {};
  const [hotelPolicy, setHotelPolicy] = useState<string>("در حال بارگذاری...");
  useEffect(() => {
    if (reserve?.hotel_name) {
      const token = localStorage.getItem("token"); // دریافت توکن از localStorage
      
      if (!token) {
        console.error("Token is missing");
        setHotelPolicy("برای مشاهده قوانین، ابتدا وارد شوید.");
        return;
      }
      if (!reserve || !reserve.hotel_name) {
        console.error("Reserve or hotel is missing");
        setHotelPolicy("اطلاعات هتل موجود نیست.");
        return;
      }
      
      // درخواست با ارسال توکن و هتل
      fetch(`http://localhost:8000/api/hotel-policy/${reserve.hotel_name}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ارسال توکن
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.policy) {
            
            setHotelPolicy(data.policy);
          } else {
            setHotelPolicy("قوانین خاصی برای این هتل ثبت نشده است.");
          }
        })
        .catch((err) => {
          console.error("Error fetching policy:", err);
          setHotelPolicy("خطا در دریافت قوانین.");
        });
    }
  }, [reserve?.hotel_name]);

  return (
    <div className={styles.voucherRoot}>
      <div className={styles.voucherContainer}>
        <div className={styles.voucherTag}>
          <h1>واچر شما آمادس!</h1>
        </div>
        <div className={styles.voucherCard}>
        <div className={styles.voucherHeader}>
        
          <div className={styles.headerRight}>
            <h2>
              {reserve.hotel_type} {reserve.hotel_name}
              <span className={styles.hotelBadge}>واچر هتل</span>
            </h2>
          </div>
          <div className={styles.headerLeft}>
            <span>قدرت گرفته از سیستم رومیکس | RoomiX System</span>
          </div>
        </div>


          <div className={styles.ticketInfo}>
            <div className={styles.leaderInfo}>
              <h3>مشخصات سرپرست</h3>
              <hr />
              <div className={styles.personInfo}>
                <p><strong>نام و نام خانوادگی:</strong> <br />{fullname}</p>
                <p><strong>شماره تماس:</strong><br /> {phone}</p>
                <p><strong>شماره پیگیری رزرو:</strong><br /> {reserve.reserve_code}</p>
                <p><strong>تاریخ صدور واچر هتل:</strong><br /> {reserve.reserve_date_shamsi}</p>
              </div>
            </div>
            <div className={styles.hotelInfo}>
              <h3>مشخصات رزرو</h3>
              <hr />
              <div className={styles.hotelInfoContent}>
                <p><strong>آدرس هتل:</strong> {reserve.hotel_address}</p>
                <p><strong>اتاق:</strong> {reserve.room_name}</p>
                <p><strong>زمان ورود:</strong> {reserve.enter} ساعت 14:00</p>
                <p><strong>زمان خروج:</strong> {reserve.exit} ساعت 12:00</p>
                <p><strong>تعداد شب اقامت:</strong> {reserve.calculate_stay_days} شب</p>
              </div>
            </div>
          </div>
          <div className={styles.rulesSection}>
            <h3>قوانین رزرو</h3>
            <div className={styles.rulePart}>
              <p>کنسلی رزرو در ایام پیک و غیر پیک، با توجه به اینکه نرخ کنسلی در ایام مختلف و هتل‌های مختلف متفاوت می‌باشد، مبلغ دقیق کنسلی بعد از استعلام از هتل مشخص می‌گردد.</p>
            </div>
            <div className={styles.dynamicPart}>
              <p>{hotelPolicy}</p>
            </div>
            <div className={styles.rulePart}>
              <p>میهمانان گرامی، نوع تخت اعلام شده بر روی سایت بعد از ارسال درخواست برای هتل و یا روز ورود میهمان مشخص می‌گردد.</p>
            </div>
          </div>
          <div className={styles.roomInfo}>
            <div className={styles.priceSection}>
              <h3>اطلاعات هزینه</h3>
              <div className={styles.totalPrice}>
                <p>مبلغ کل:</p>
                <p>{formatPrice(reserve.price)} تومان</p>
              </div>
            </div>
          </div>

        </div>
        <div className={styles.voucherActions}>
          <button
            className={`${styles.voucherButton} ${styles.voucherButtonDownload}`}
            onClick={() => window.print()}
          >
            دانلود
          </button>
          <button className={`${styles.voucherButton} ${styles.voucherButtonShare}`}>
            اشتراک گذاری
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherPage;
