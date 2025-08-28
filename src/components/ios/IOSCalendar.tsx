
import { useState, useMemo, useEffect } from 'react';

interface IOSCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  markedDates?: string[]; // Array of dates with records, YYYY-MM-DD
  onChange: (date: string) => void;
}

const IOSCalendar = ({ selectedDate, markedDates = [], onChange }: IOSCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
  }, [selectedDate]);

  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
  const startingDayOfWeek = useMemo(() => firstDayOfMonth.getDay(), [firstDayOfMonth]); // 0 (Sun) to 6 (Sat)

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const date = String(newDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    onChange(dateString);
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isSelected = dateStr === selectedDate;
    const isMarked = markedDates.includes(dateStr);

    days.push(
      <div key={i} className="flex flex-col items-center justify-center">
        <button
          onClick={() => handleDateClick(i)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            isSelected ? 'bg-blue-500 text-white' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isMarked ? 'bg-blue-500' : 'bg-transparent'}`}></div>
      </div>
    );
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-white p-1 rounded-lg shadow-lg w-full">
      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-800">
          &lt;
        </button>
        <h2 className="font-semibold text-gray-800">{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-800">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-800">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {days}
      </div>
    </div>
  );
};

export default IOSCalendar;
