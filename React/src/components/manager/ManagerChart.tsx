import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // اضافه‌شده
import moment from 'jalali-moment';
import BedIcon from '@mui/icons-material/Bed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import OtherHousesIcon from '@mui/icons-material/OtherHouses';
import "../../assets/Css/Reservations.css";
import GroupIcon from '@mui/icons-material/Group';
import UserManagement from './user/UserManagement';
import HotelManagement from './hotel/HotelManagement';
import RoomList from './rooms/RoomList';
import RoomForm from './rooms/RoomForm';
import RoomManagement from './rooms/RoomManagement';



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

const ManagerChart: React.FC = () => {
  const [activeView, setActiveView] = useState<string>('rooms'); // 'rack', 'reservation', یا 'bookings'
  const todayDateJalali = moment().locale('fa').format('jYYYY/jMM/jDD dddd');
  const navigate = useNavigate(); // استفاده از useNavigate برای مسیریابی


  const handleViewChange = (view: string) => {
    setActiveView(view);
  };



  return (
    <div className="reservations-container">
      <div className="header-buttons">
        <div className="tab-buttons">
          <button
            className={`custom-tab-button ${activeView === 'hotel' ? 'active' : ''}`}
            onClick={() => handleViewChange('hotel')}
          >
            <OtherHousesIcon style={{ fontSize: 18 }} />
            <span className="tab-text">هتل</span>
          </button>
          <button
            className={`custom-tab-button ${activeView === 'rooms' ? 'active' : ''}`}
            onClick={() => handleViewChange('rooms')}
          >
            <BedIcon style={{ fontSize: 18 }} />
            <span className="tab-text">اتاق ها</span>
          </button>
          <button
            className={`custom-tab-button ${activeView === 'users' ? 'active' : ''}`}
            onClick={() => handleViewChange('users')}
          >
            <GroupIcon style={{ fontSize: 18 }} />
            <span className="tab-text">یوزر ها</span>
          </button>
        </div>
        
      </div>
      <div className="spacer"></div>

      {activeView === 'hotel' && (
        <>
            <HotelManagement />
        </>
      )}

      {activeView === 'rooms' && (
        <>
          <RoomManagement />
         
        </>
      )}

      {activeView === 'users' && (
        <>
        <UserManagement />
        </>
      )}
    </div>
  );
};

export default ManagerChart;
