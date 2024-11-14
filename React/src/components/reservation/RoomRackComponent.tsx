import React, { useState, useEffect } from 'react';
import { Room, Floor } from './ReservationsChart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxArchive, faSquareCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import moment from 'jalali-moment';
import FiltersComponent from './FiltersComponent';

// تابع کمکی برای خواندن کوکی‌ها
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const RoomRackComponent: React.FC = () => {
  const [floorsData, setFloorsData] = useState<Floor[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [filteredDates, setFilteredDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(moment().locale('fa').format('jYYYY/jMM/jDD'));
  const [selectedBeds, setSelectedBeds] = useState<number[]>([]);
  const [numberOfNights, setNumberOfNights] = useState<number>(4);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const todayJalali = moment().locale('fa').format('jYYYY/jMM/jDD');

  // گرفتن hotelIdentifier از کوکی
  const profileInfoString = getCookie('profile_info');
  const hotelIdentifier = profileInfoString ? JSON.parse(profileInfoString)?.hotel?.id : null;

  // تابع برای تولید تاریخ‌های 30 روز آینده
  const generateNext30Days = (): string[] => {
    const dates = [];
    let currentDate = moment().locale('en');
    for (let i = 0; i < 30; i++) {
      dates.push(currentDate.format('YYYY/MM/DD'));  // تبدیل به میلادی
      currentDate = currentDate.add(1, 'days');
    }
    return dates;
  };

  // تابع برای تولید تاریخ‌های مورد نیاز پس از جستجو بر اساس تعداد شب‌ها
  const generateSearchRange = (searchDate: string, nights: number): string[] => {
    const dates = [];
    let startDate;

    if (nights < 4) {
      startDate = moment(searchDate, 'jYYYY/jMM/jDD').locale('en').subtract(3, 'days'); // 3 روز قبل
      for (let i = 0; i < nights + 6; i++) { // 3 روز قبل + تعداد شب‌ها + 3 روز بعد
        dates.push(startDate.format('YYYY/MM/DD'));
        startDate = startDate.add(1, 'days');
      }
    } else {
      startDate = moment(searchDate, 'jYYYY/jMM/jDD').locale('en').subtract(2, 'days'); // 2 روز قبل
      for (let i = 0; i < nights + 4; i++) { // 2 روز قبل + تعداد شب‌ها + 2 روز بعد
        dates.push(startDate.format('YYYY/MM/DD'));
        startDate = startDate.add(1, 'days');
      }
    }
    return dates;
  };

  // محاسبه تعداد شب‌ها برای ارسال درخواست به API
  const calculateTotalNights = (nights: number): number => {
    if (nights < 4) {
      return nights + 6; // 3 شب قبل و 3 شب بعد
    } else {
      return nights + 4; // 2 شب قبل و 2 شب بعد
    }
  };

  // درخواست اطلاعات با Fetch API
  const fetchFloorsData = async (hotelId: string, selectedDate: string, totalNights: number, selectedBeds: number[]) => {
    try {
      const response = await fetch('http://localhost:8000/api/room-rack/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          hotelId,        // آیدی هتل
          selectedDate,   // تاریخ شروع (میلادی)
          numberOfNights: totalNights,  // تعداد شب‌ها
          selectedBeds,   // تعداد تخت‌های انتخاب‌شده
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setFloorsData(data.floorsData || []);  // ذخیره داده‌های دریافت‌شده
    } catch (error) {
      console.error('Error fetching floors data:', error);
    }
  };

  // درخواست اولیه برای نمایش اطلاعات تا 30 روز آینده
  useEffect(() => {
    if (hotelIdentifier) {
      const initialDates = generateNext30Days();
      setDates(initialDates);
      fetchFloorsData(hotelIdentifier, todayJalali, 30, []); // درخواست برای نمایش 30 روز آینده با تمام تخت‌ها
    }
  }, [hotelIdentifier]);

  // تابع برای ارسال درخواست جستجو بر اساس فیلتر‌ها
  const handleSearch = () => {
    if (!hotelIdentifier) {
      console.error('Hotel identifier is missing');
      return;
    }

    setIsSearching(true); // فعال‌سازی حالت جستجو

    // محاسبه تاریخ شروع و تعداد شب‌ها برای جستجو
    const searchRangeDates = generateSearchRange(selectedDate, numberOfNights);
    const totalNights = calculateTotalNights(numberOfNights);

    // تاریخ شروع جستجو بر اساس تاریخ جلالی
    const searchStartDate = numberOfNights < 4 
      ? moment(selectedDate, 'jYYYY/jMM/jDD').locale('en').subtract(3, 'days').format('jYYYY/jMM/jDD') 
      : moment(selectedDate, 'jYYYY/jMM/jDD').locale('en').subtract(2, 'days').format('jYYYY/jMM/jDD');

    setFilteredDates(searchRangeDates); // تنظیم تاریخ‌های فیلتر شده بر اساس جستجو

    // ارسال درخواست به API با تاریخ شروع و تعداد شب‌های مناسب
    fetchFloorsData(hotelIdentifier, searchStartDate, totalNights, selectedBeds);
  };

  const displayedDates = isSearching ? filteredDates : dates; // تعیین اینکه تاریخ‌ها از پیش‌فرض نمایش داده شوند یا جستجو

  return (
    <div>
      {/* کامپوننت فیلتر */}
      <FiltersComponent
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        numberOfNights={numberOfNights}
        setNumberOfNights={setNumberOfNights}
        selectedBeds={selectedBeds}
        setSelectedBeds={setSelectedBeds}
        handleSearch={handleSearch}
      />

      <div className="rooms-list">
        <div className="reservation-header">
        {displayedDates.map((date, index) => {
  // بررسی اینکه آیا تاریخ در بازه انتخابی قرار دارد
  const isInSelectedRange =
    isSearching &&
    moment(date, 'YYYY/MM/DD').isSameOrAfter(
      moment(selectedDate, 'jYYYY/jMM/jDD').locale('en')
    ) &&
    moment(date, 'YYYY/MM/DD').isBefore(
      moment(selectedDate, 'jYYYY/jMM/jDD').locale('en').add(numberOfNights, 'days')
    );

  // کلاس برای تاریخ انتخابی
  const dateClass = isInSelectedRange ? 'selected-date' : '';

  return (
    <div key={index} className={`date-header ${dateClass}`}>
      {moment(date, 'YYYY/MM/DD').locale('fa').format('jMM/jDD')} {/* نمایش تاریخ به جلالی */}
    </div>
  );
})}

        </div>
        {floorsData.map((floor) => (
          <div key={floor.floorNumber} className="floor">
            {floor.rooms.map((room) => (
  <div key={room.id} className="reservation-row">
    <div className="room-number">
      <span>{room.number} </span>
      <div className="bed-info">{room.beds} تخته</div> {/* تعداد تخت زیر شماره اتاق */}
    </div>
    {displayedDates.map((date) => {
      const isBeforeToday = moment(date, 'YYYY/MM/DD').isBefore(moment().format('YYYY/MM/DD')); // بررسی اینکه تاریخ قبل از امروز است
      const reservedDate = room.reservedDates?.find((d) => d.date === date); // بررسی رزرو بودن تاریخ
      const dailyPrice = room.dailyPrices?.find((d) => d.date === date)?.price || 0;
      const price = reservedDate ? reservedDate.price : dailyPrice;

      // بررسی اینکه تاریخ گذشته و خالی است
      const isLostOpportunity = isBeforeToday && !reservedDate;

      // کلاس CSS برای هر وضعیت
      const statusClass = isLostOpportunity
        ? 'lost-opportunity'
        : reservedDate
        ? 'occupied'
        : 'available';

      return (
        <div key={date} className={`status-box ${statusClass}`}>
          {reservedDate ? (
            <>
              <FontAwesomeIcon icon={faXmark} size="lg" /> {/* آیکون قرمز */}
              <div className="price-info">{price.toLocaleString()}</div>
            </>
          ) : isLostOpportunity ? (
            <>
              <FontAwesomeIcon icon={faBoxArchive} /> {/* آیکون سبز */}
              <div className="lost-text">آرشیوی</div>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSquareCheck} size="lg" /> {/* آیکون سبز */}
              <div className="price-info">{price.toLocaleString()}</div>
            </>
          )}
        </div>
      );
    })}
  </div>
))}

          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomRackComponent;
