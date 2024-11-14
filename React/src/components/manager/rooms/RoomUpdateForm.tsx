import React, { useState, useEffect } from "react";
import styles from "../../../assets/Css/manager/rooms/RoomForm.module.css";

interface RoomType {
  id: number;
  type_name_fa: string;
}

interface RoomFormProps {
  onRoomUpdated: () => void;
}

const RoomForm: React.FC<RoomFormProps> = ({ onRoomUpdated }) => {
  const [roomData, setRoomData] = useState({
    id: null,
    number: "", // Required
    name_fa: "",
    room_type: "",
    base_price: "",
    bed_count: "",
    floor: "",
    meal_plan: "breakfast",
    image: null as File | null,
  });

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/room-types/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch room types");
      }

      const data = await response.json();
      setRoomTypes(data);
    } catch (error) {
      console.error("Error fetching room types:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setRoomData((prev) => ({ ...prev, image: file }));
  };

  const validateForm = () => {
    if (!roomData.number) {
      setError("شماره اتاق ضروری است.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!roomData.number) {
        alert("شماره اتاق ضروری است."); // Notify the user
        return;
    }

    const formData = new FormData();
    Object.entries(roomData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
            formData.append(key, value instanceof File ? value : value.toString());
        }
    });


    try {
        const response = await fetch("http://localhost:8000/api/rooms/", {
            method: roomData.id ? "PUT" : "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(errorData.error || "Failed to update/create room");
        }

        alert("اطلاعات اتاق با موفقیت به‌روزرسانی شد!");
        onRoomUpdated();
    } catch (error) {
        console.error("Error updating/creating room:", error);
        setError(error.message);
    }
};

  
  

  return (
    <form className={styles.roomForm} onSubmit={handleSubmit}>
      {error && <p className={styles.error}>{error}</p>}
      <h2>به‌روزرسانی اتاق</h2>
      <div className={styles.inputs}>
      <input
        name="number"
        placeholder="شماره اتاق (ضروری)"
        onChange={handleChange}
        value={roomData.number}
        required
      />
      <input
        name="name_fa"
        placeholder="نام"
        onChange={handleChange}
        value={roomData.name_fa}
      />
      <select name="room_type" onChange={handleChange} value={roomData.room_type}>
        <option value="">انتخاب نوع اتاق</option>
        {roomTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.type_name_fa}
          </option>
        ))}
      </select>
      <input
        name="base_price"
        placeholder="قیمت پایه"
        onChange={handleChange}
        value={roomData.base_price}
      />
      <input
        name="bed_count"
        placeholder="تعداد تخت"
        onChange={handleChange}
        value={roomData.bed_count}
      />
      <input
        name="floor"
        placeholder="طبقه"
        onChange={handleChange}
        value={roomData.floor}
      />
      <select name="meal_plan" onChange={handleChange} value={roomData.meal_plan}>
        <option value="breakfast">صبحانه</option>
        <option value="half_board">هافبرد</option>
        <option value="full_board">فولبرد</option>
        <option value="all_inclusive">همه‌چیز شامل</option>
      </select>
      <input type="file" name="image" onChange={handleFileChange} />
      </div>
      <button type="submit">ثبت</button>
    </form>
  );
};

export default RoomForm;
