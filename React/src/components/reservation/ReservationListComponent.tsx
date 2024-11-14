import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'jalali-moment';
import '../../assets/Css/ReservationList.css';

interface Reservation {
  id: number;
  checkIn: string;
  checkOut: string;
  guestName: string;
  roomNumber: number;
  bookingDate: string;
  bookingNumber: string;
  paymentMethod: string;
  status: string; // 'Pending Payment', 'Awaiting Check-In', 'Current Guest', 'Checked Out', 'Canceled'
}

const paymentMethodMap: { [key: string]: string } = {
  website: 'وبسایت-درگاه',
  reservation: 'رزرواسیون-اعتباری',
  marketplace: 'مارکت‌پلیس-اعتباری',
  travelagency: 'آژانس-اعتباری'
};

const statusMap: { [key: string]: string } = {
  PENDING_PAYMENT: 'منتظر پرداخت',
  AWAITING_CHECKIN: 'منتظر ورود',
  CURRENT_GUEST: 'مهمان فعلی',
  CHECKED_OUT: 'خروج کرده',
  CANCELLED: 'کنسل شده',
};

const ReservationListComponent: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/reservations_list/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleCancelReservation = async (id: number) => {
    try {
      await axios.post(
        `http://localhost:8000/api/reservations/${id}/cancel/`,
        {}, // درخواست POST ممکن است به بدنه نیاز داشته باشد. در صورت عدم نیاز، یک آبجکت خالی ارسال کنید.
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // اضافه کردن توکن احراز هویت به هدر
          },
        }
      );
      fetchReservations();
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };
  

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="reservation-list">
      <table className="reservation-table">
        <thead>
          <tr>
            <th>شماره رزرو</th>
            <th>نام مهمان</th>
            <th>ورود</th>
            <th>خروج</th>
            <th>اتاق</th>
            <th>نحوه پرداخت</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.bookingNumber}</td>
              <td>{reservation.guestName}</td>
              <td>{moment(reservation.checkIn).locale('fa').format('YYYY/MM/DD')}</td>
              <td>{moment(reservation.checkOut).locale('fa').format('YYYY/MM/DD')}</td>
              <td>{reservation.roomNumber}</td>
              <td>{paymentMethodMap[reservation.paymentMethod] || 'نامشخص'}</td>
              <td>{statusMap[reservation.status] || 'نامشخص'}</td>
              <td>
                {reservation.status === 'AWAITING_CHECKIN' && (
                  <button
                    className="cancel-button"
                    onClick={() => handleCancelReservation(reservation.id)}
                  >
                    لغو رزرو
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationListComponent;
