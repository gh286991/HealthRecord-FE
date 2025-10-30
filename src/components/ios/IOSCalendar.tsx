
import { useState, useMemo, useEffect, type ReactElement } from 'react';

interface IOSCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  markedDates?: string[]; // Array of dates with records, YYYY-MM-DD
  pendingDates?: string[]; // 課表未開始日期 YYYY-MM-DD
  onChange: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void; // 月份改變回呼
  displayYear?: number; // 由父層控制顯示的年（可選）
  displayMonth?: number; // 由父層控制顯示的月（1-12，可選）
  loading?: boolean; // 標記資料載入中
}

const IOSCalendar = ({ selectedDate, markedDates = [], pendingDates = [], onChange, onMonthChange, displayYear, displayMonth, loading = false }: IOSCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  useEffect(() => {
    // 在受控模式（有傳入 displayYear/displayMonth）時，不根據 selectedDate 自動覆寫月份，
    // 以避免父層切換月份時被 selectedDate 反向回跳
    if (typeof displayYear === 'number' && typeof displayMonth === 'number') return;
    setCurrentDate(new Date(selectedDate));
  }, [selectedDate, displayYear, displayMonth]);

  // 受控顯示月份（若父層提供 displayYear/displayMonth，就以其為準）
  useEffect(() => {
    if (typeof displayYear === 'number' && typeof displayMonth === 'number') {
      setCurrentDate(new Date(displayYear, displayMonth - 1, 1));
    }
  }, [displayYear, displayMonth]);

  const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate]);
  const startingDayOfWeek = useMemo(() => firstDayOfMonth.getDay(), [firstDayOfMonth]); // 0 (Sun) to 6 (Sat)

  const prevMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(next);
    onMonthChange?.(next.getFullYear(), next.getMonth() + 1);
  };

  const nextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
    onMonthChange?.(next.getFullYear(), next.getMonth() + 1);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const date = String(newDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${date}`;
    onChange(dateString);
  };

  // 建立固定 6 週 (42 格) 的日期格，確保高度不隨月份改變
  const days: ReactElement[] = [];
  const TOTAL_CELLS = 42;
  for (let cell = 0; cell < TOTAL_CELLS; cell++) {
    const dayNum = cell - startingDayOfWeek + 1;
    const inCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
    if (!inCurrentMonth) {
      days.push(
        <div key={`pad-${cell}`} className="flex flex-col items-center justify-center w-10 h-12">
          <div className="w-7 h-7 rounded-full" aria-hidden />
          <div className="w-1.5 h-1.5 rounded-full mt-0.5 bg-transparent" aria-hidden />
        </div>
      );
      continue;
    }
    const i = dayNum;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isSelected = dateStr === selectedDate;
    const isMarked = markedDates.includes(dateStr);
    const isPending = pendingDates.includes(dateStr);
    days.push(
      <div key={`d-${i}`} className="flex flex-col items-center justify-center w-10 h-12">
        <button
          onClick={() => handleDateClick(i)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            isSelected ? 'bg-blue-500 text-white' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isPending ? 'bg-orange-500' : (isMarked ? 'bg-blue-500' : 'bg-transparent')}`}></div>
      </div>
    );
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="relative bg-white p-1 rounded-lg shadow-lg w-full" aria-busy={loading} aria-live="polite">
      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-800">
          &lt;
        </button>
        <div className="flex items-center">
          <h2 className="font-semibold text-gray-800">{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</h2>
          {loading && (
            <span
              className="ml-2 inline-block h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
              aria-label="載入中"
            />
          )}
        </div>
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

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <span className="inline-block h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <div className="mt-3 text-sm font-medium text-gray-700">載入中…</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IOSCalendar;
