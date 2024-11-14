import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "jalali-moment";
import "../../assets/Css/RoomCard.css";

interface DailyPrice {
  date: string;
  price: number;
}

interface RoomCardProps {
  name: string;
  imageUrl: string;
  discountedPrice: number;
  discountPercentage: number;
  originalPrice: number;
  total_price: number;
  dailyPrices: DailyPrice[];
}

// Function to format prices with commas
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Function to convert date to Persian format
const formatToPersianDate = (date: string): string => {
  return moment(date, "YYYY-MM-DD")
    .locale("fa")
    .format("jYYYY/jMM/jDD dddd");
};

const RoomCard: React.FC<RoomCardProps> = ({
  name,
  imageUrl,
  discountedPrice,
  discountPercentage,
  originalPrice,
  total_price,
  dailyPrices,
}) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const fullImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : `http://localhost:8000${imageUrl}`;

  const handlePurchase = () => {
    navigate("/reservation/informations", {
      state: {
        selectedRoom: {
          name,
          total_price,
          imageUrl,
          checkInDate: dailyPrices[0]?.date || "",
          nights: dailyPrices.length,
          dailyPrices,
        },
      },
    });
  };

  return (
    <div>
      <div className={`room-card ${showDetails ? "expanded" : ""}`}>
        <div className="reserve-info-section">
          <img src={fullImageUrl} alt={name} className="room-image" />
          <h3 className="room-name">{name}</h3>
        </div>
        <div className="divider"></div>
        <div className="buy-section">
          <div className="price-section">
            <span className="discounted-price">
              {formatPrice(total_price)} تومان
            </span>
            <span className="base-price">
              <span className="discount-percentage">{discountPercentage}%-</span>
              <span className="original-price">{formatPrice(originalPrice)}</span>
            </span>
          </div>
          <button className="buy-button" onClick={handlePurchase}>
            خرید
          </button>
          <button
            className="details-button"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "بستن جزئیات" : "نمایش جزئیات"}
          </button>
        </div>
      </div>
      {showDetails && (
        <div className="daily-prices">
          {dailyPrices.map((daily, index) => (
            <div key={index} className="daily-price-item">
              <span className="daily-price-date">
                {formatToPersianDate(daily.date)}
              </span>
              <span className="daily-price-amount">
                {formatPrice(daily.price)} تومان
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomCard;
