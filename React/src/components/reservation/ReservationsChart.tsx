import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // اضافه‌شده
import moment from 'jalali-moment';
import BedIcon from '@mui/icons-material/Bed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import "../../assets/Css/Reservations.css";
import RoomListComponent from './RoomListComponent';
import RoomRackComponent from './RoomRackComponent';
import ReservationListComponent from './ReservationListComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faCashRegister, faXmark } from '@fortawesome/free-solid-svg-icons';


export interface Room {
  id: number;
  number: number;
  beds: number;
  isOccupied: boolean;
  reservedDates?: { date: string; price: number }[];
  dailyPrices?: { date: string; price: number }[];
}

export interface Floor {
  floorNumber: number;
  rooms: Room[];
}

const ReservationsChart: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('reservation'); // 'rack', 'reservation', یا 'bookings'
  const todayDateJalali = moment().locale('fa').format('jYYYY/jMM/jDD dddd');
  const navigate = useNavigate(); // استفاده از useNavigate برای مسیریابی


  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const handleReservationRedirect = () => {
    navigate('/reservation');
  };

  return (
    <div className="reservations-container">
      <div className="header-buttons">
        <div className="tab-buttons">
          <button
            className={`custom-tab-button ${activeView === 'bookings' ? 'active' : ''}`}
            onClick={() => handleViewChange('bookings')}
          >
            <ListAltIcon style={{ fontSize: 18 }} />
            <span className="tab-text">رزرو ها</span>
          </button>
          <button
            className={`custom-tab-button ${activeView === 'rack' ? 'active' : ''}`}
            onClick={() => handleViewChange('rack')}
          >
            <BedIcon style={{ fontSize: 18 }} />
            <span className="tab-text">رک اتاق</span>
          </button>
          <button
            className={`custom-tab-button ${activeView === 'reservation' ? 'active' : ''}`}
            onClick={() => handleViewChange('reservation')}
          >
            <CalendarTodayIcon style={{ fontSize: 18 }} />
            <span className="tab-text">وضعیت</span>
          </button>
        </div>
        <div className="date-container">
          <div className="date">امروز: {todayDateJalali}</div>
          <button className="redirect-button" onClick={handleReservationRedirect}>
          <FontAwesomeIcon icon={faCashRegister} size="lg" />
            رزرواسیون انلاین
          </button>
        </div>
      </div>
      <div className="spacer"></div>

      {activeView === 'bookings' && (
        <>
          <ReservationListComponent />
        </>
      )}

      {activeView === 'rack' && (
        <>
          <RoomRackComponent />
        </>
      )}

      {activeView === 'reservation' && (
        <>
          <h3 className="floor-title">طبقات</h3>
          <RoomListComponent />
        </>
      )}
    </div>
  );
};

export default ReservationsChart;
