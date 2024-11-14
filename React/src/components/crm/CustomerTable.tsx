import React, { useEffect, useState } from 'react';
import moment from 'jalali-moment';
import '../../assets/Css/CustomerTable.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquareCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

// تابع کمکی برای خواندن کوکی‌ها
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

interface Reservation {
  reservation_id: string;
  check_in: string;
  check_out: string;
  room: string;
  payment_method: string;
}

interface Customer {
  full_name: string;
  nid: string;
  emergency_contact: string;
  is_current_guest: boolean;
  reservations: Reservation[];
}

const CustomerTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  // گرفتن آیدی هتل از کوکی
  const profileInfoString = getCookie('profile_info');
  const hotelIdentifier = profileInfoString ? JSON.parse(profileInfoString)?.hotel?.id : null;

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!hotelIdentifier) {
        console.error('Hotel identifier is missing');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/hotel_crm/customers/', {
          method: 'POST',  // استفاده از POST برای ارسال آیدی هتل
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // ارسال توکن احراز هویت
          },
          body: JSON.stringify({
            hotel_id: hotelIdentifier,  // اضافه کردن آیدی هتل به بدنه درخواست
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }

        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, [hotelIdentifier]);

  return (
    <div className="table-container">
      <h6 className="table-title">جدول مشتری‌ها</h6>
      <table className="customer-table">
      <thead>
        <tr>
          <th>نام</th>
          <th>کد ملی</th> {/* اضافه کردن ستون */}
          <th>شماره همراه</th>
          <th>مهمان فعلی</th>
          <th>تاریخچه رزرو</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer, index) => (
          <React.Fragment key={index}>
            <tr>
              <td>{customer.full_name}</td>
              <td>{customer.nid}</td> {/* نمایش کد ملی */}
              <td>{customer.emergency_contact}</td>
              <td
                className={`current-guest ${customer.is_current_guest ? 'guest-yes' : 'guest-no'}`}
              >
                {customer.is_current_guest ? (
                  <>
                    <FontAwesomeIcon icon={faSquareCheck} />
                    <span> بله</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faXmark} />
                    <span> خیر</span>
                  </>
                )}
              </td>
              <td>
                <details>
                  <summary>مشاهده رزروها</summary>
                  {customer.reservations.length > 0 ? (
                    <table className="reservation-table">
                      <thead>
                        <tr>
                          <th>شماره رزرو</th>
                          <th>تاریخ ورود</th>
                          <th>تاریخ خروج</th>
                          <th>اتاق</th>
                          <th>نحوه پرداخت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.reservations.map((reservation, resIndex) => (
                          <tr key={resIndex}>
                            <td>{reservation.reservation_id}</td>
                            <td>{moment(reservation.check_in, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD')}</td>
                            <td>{moment(reservation.check_out, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD')}</td>
                            <td>{reservation.room}</td>
                            <td>{reservation.payment_method}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>رزروی وجود ندارد</p>
                  )}
                </details>
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;
