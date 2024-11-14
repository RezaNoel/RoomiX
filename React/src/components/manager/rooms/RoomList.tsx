import React, { useEffect, useState } from "react";
import styles from "../../../assets/Css/manager/rooms/RoomList.module.css"; // وارد کردن CSS به عنوان ماژول

interface Room {
  id: number;
  number: string;
  name: string;
  room_type: string;
  base_price: number;
  calculated_price: number;
  bed_count: number;
  is_available: boolean;
  floor: number;
  meal_plan: string;
  image: string | null;
}

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/rooms/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  return (
    <div className={styles.roomListContainer}>
      {rooms.map((room) => (
        <div key={room.id} className={styles.roomCard}>
          <div className={styles.reserveInfoSection}>
            <img
              src={`http://localhost:8000/${room.image || "placeholder.jpg"}`}
              alt={room.name}
              className={styles.roomImage}
              onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
            />
            <h3 className={styles.roomName}>{room.name}</h3>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.roomDetails}>
            <p>شماره اتاق: {room.number}</p>
            <p>نوع اتاق: {room.room_type}</p>
            <p>برنامه غذایی: {room.meal_plan}</p>
            <p>تعداد تخت: {room.bed_count}</p>
            <p>طبقه: {room.floor}</p>
            <p>قیمت پایه: {room.base_price.toLocaleString()} تومان</p>
            <p>قیمت نهایی: {room.calculated_price.toLocaleString()} تومان</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
