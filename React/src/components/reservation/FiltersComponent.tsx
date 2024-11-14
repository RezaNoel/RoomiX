import React, { useState } from "react";
import "../../assets/Css/FiltersComponent.css";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface FiltersComponentProps {
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  numberOfNights: number;
  setNumberOfNights: React.Dispatch<React.SetStateAction<number>>;
  selectedBeds: number[];
  setSelectedBeds: React.Dispatch<React.SetStateAction<number[]>>;
  handleSearch: () => void;
}

const bedOptions = [1, 2, 3, 4];

// تابعی برای تبدیل اعداد فارسی به اعداد انگلیسی
const convertToEnglishNumbers = (dateString: string): string => {
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let englishDate = dateString;
  for (let i = 0; i < 10; i++) {
    englishDate = englishDate.replace(persianNumbers[i], englishNumbers[i]);
  }
  return englishDate;
};

const FiltersComponent: React.FC<FiltersComponentProps> = ({
  selectedDate,
  setSelectedDate,
  numberOfNights,
  setNumberOfNights,
  selectedBeds,
  setSelectedBeds,
  handleSearch,
}) => {
  const [isBedDropdownOpen, setBedDropdownOpen] = useState(false);

  const toggleBedDropdown = () => setBedDropdownOpen(!isBedDropdownOpen);

  const handleBedsChange = (bed: number) => {
    if (selectedBeds.includes(bed)) {
      setSelectedBeds(selectedBeds.filter((b) => b !== bed));
    } else {
      setSelectedBeds([...selectedBeds, bed]);
    }
  };

  return (
    <div className="filters">
      {/* فیلتر تاریخ */}
      <div className="custom-select-container">
        <label className="filter-label">تاریخ</label>
        <DatePicker
          value={selectedDate}
          onChange={(date) =>
            setSelectedDate(convertToEnglishNumbers(date?.format("YYYY/MM/DD") || "")) // تبدیل به اعداد انگلیسی
          }
          calendar={persian}
          locale={persian_fa}
          inputClass="custom-input"
        />
      </div>

      {/* فیلتر تعداد شب */}
      <div className="custom-select-container">
        <label className="filter-label">تعداد شب</label>
        <select
          className="custom-select"
          value={numberOfNights}
          onChange={(e) => setNumberOfNights(Number(e.target.value))}
        >
          {[...Array(8).keys()].map((night) => (
            <option key={night + 1} value={night + 1}>
              {night + 1} شب
            </option>
          ))}
        </select>
      </div>

      {/* فیلتر تعداد تخت */}
      <div className="custom-select-container">
  <label className="filter-label">تعداد تخت</label>
  <div className="custom-dropdown" onClick={toggleBedDropdown}>
    <div className="custom-select">
      {selectedBeds.length > 0
        ? selectedBeds.map((bed) => `${bed} تخته`).join("، ")
        : "انتخاب تعداد تخت"}
    </div>
    {isBedDropdownOpen && (
      <div className="custom-dropdown-menu">
        {bedOptions.map((bed) => (
          <label key={bed} className="checkbox-label">
            <input
              type="checkbox"
              value={bed}
              checked={selectedBeds.includes(bed)}
              onChange={() => handleBedsChange(bed)}
            />
            {bed} تخت
          </label>
        ))}
      </div>
    )}
  </div>
</div>


      {/* دکمه جستجو */}
      <div className="custom-select-container">
        <button className="search-button" onClick={handleSearch}>
          جستجو
        </button>
      </div>
    </div>
  );
};

export default FiltersComponent;
