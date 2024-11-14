import React, { useEffect, useState } from 'react';
import moment from 'jalali-moment';

// تابع کمکی برای خواندن کوکی‌ها
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

interface Room {
  id: number;
  number: string;
  beds: number;
  isOccupied: boolean;
  reservedDates?: { date: string; price: number }[];
  dailyPrices?: { date: string; price: number }[];
}

interface Floor {
  floorNumber: number;
  rooms: Room[];
}

const RoomListComponent: React.FC = () => {
  const [floorsData, setFloorsData] = useState<Floor[]>([]);
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const selectedDateJalali = moment().locale('fa').format('jYYYY/jMM/jDD');
  const todayDateGregorian = moment().locale('en').format('YYYY/MM/DD');

  // گرفتن hotelIdentifier از کوکی
  const profileInfoString = getCookie('profile_info');
  const hotelIdentifier = profileInfoString ? JSON.parse(profileInfoString)?.hotel?.id : null;

  // تابع فچ برای دریافت داده‌ها از API
  const fetchFloorsData = async (hotelId: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/room-list/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // اضافه کردن توکن احراز هویت به هدر
        },
        body: JSON.stringify({
          unique_identifier: hotelId,  // اضافه کردن unique_identifier به درخواست
          selectedDate: selectedDateJalali,    // تاریخ انتخاب‌شده جلالی
          numberOfNights: 1,                   // تعداد شب‌ها
          selectedBeds: [1, 2, 3, 4]           // تعداد تخت‌های انتخاب‌شده
        })
      });

      if (response.status === 401) {
        console.error('Unauthorized. Please login again.');
        return;
      }

      if (response.status === 403) {
        console.error('Access denied. Please check your permissions or authentication token.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setFloorsData(data.floorsData || []);  // ذخیره داده‌های دریافت‌شده
    } catch (error) {
      console.error('Error fetching floors data:', error);
    }
  };

  // استفاده از useEffect برای فچ کردن داده‌های اتاق پس از دریافت hotelIdentifier
  useEffect(() => {
    if (hotelIdentifier) {
      fetchFloorsData(hotelIdentifier);
    }
  }, [hotelIdentifier]);

  // تابعی برای تبدیل تاریخ میلادی به جلالی (فقط ماه و روز)
  const convertToJalaliMonthDay = (gregorianDate: string): string => {
    return moment(gregorianDate, 'YYYY/MM/DD').locale('fa').format('jMM/jDD');  // تبدیل به جلالی و فقط ماه و روز
  };

  // تابعی برای بررسی اینکه اتاق رزرو شده یا خیر
  const isRoomReservedToday = (room: Room): boolean => {
    return room.reservedDates?.some(
      (reservation) => reservation.date === todayDateGregorian
    ) || false;
  };

  return (
    <div className="floors-container">
      {floorsData.length > 0 ? (
        floorsData.map((floor) => (
          <div key={floor.floorNumber}>
            <div className="floor-header">طبقه {floor.floorNumber}</div>
            <div className="rooms-container">
              {floor.rooms.map((room) => {
                const roomIsReservedToday = isRoomReservedToday(room);

                return (
                  <div
                    key={room.id}
                    className={`room ${roomIsReservedToday ? 'occupied' : 'available'}`}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                  >
                    {room.number}
                    {!roomIsReservedToday && room.dailyPrices && (
                      <div className="daily-price-info">
                        {room.dailyPrices.map((dailyPrice) => (
                          <div key={dailyPrice.date}>
                            {dailyPrice.price.toLocaleString()}
                          </div>
                        ))}
                      </div>
                    )}
                    {hoveredRoom === room.id && room.reservedDates && (
                      <div className="hover-info">
                        {room.reservedDates.map((reservation) => (
                          <div key={reservation.date} className="hover-date">
                            <span>{convertToJalaliMonthDay(reservation.date)}</span>  {/* تبدیل تاریخ به جلالی */}
                            <span>{reservation.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <p>در حال بارگذاری...</p>  // نمایش پیغام در حال بارگذاری در صورت نبود داده
      )}
    </div>
  );
};

export default RoomListComponent;
