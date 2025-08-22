'use client';

import { useMemo, useState, useEffect } from 'react';
import WheelPicker, { WheelOption } from '../WheelPicker';
import IOSBottomSheet from './IOSBottomSheet';

interface IOSDatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
  className?: string;
}

export default function IOSDatePicker({ selectedDate, onChange, className = '' }: IOSDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());

  // 同步外部值到內部狀態
  useEffect(() => {
    const d = selectedDate && !isNaN(new Date(selectedDate).getTime()) ? new Date(selectedDate) : new Date();
    setCurrentDate(d);
    setTempDate(d);
  }, [selectedDate]);

  const handleConfirm = () => {
    onChange(tempDate.toISOString().split('T')[0]);
    setCurrentDate(tempDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDate(currentDate);
    setIsOpen(false);
  };

  const jumpToday = () => {
    const today = new Date();
    setTempDate(today);
  };

  const years: WheelOption<number>[] = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => y - 10 + i).map(v => ({ label: `${v}年`, value: v }));
  }, []);
  const months: WheelOption<number>[] = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1).map(v => ({ label: `${v}月`, value: v })), []);
  const days: WheelOption<number>[] = useMemo(() => {
    const daysInMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1).map(v => ({ label: `${v}日`, value: v }));
  }, [tempDate]);

  const headerDate = useMemo(() => {
    const y = tempDate.getFullYear();
    const m = (tempDate.getMonth() + 1).toString().padStart(2, '0');
    const d = tempDate.getDate().toString().padStart(2, '0');
    return `${y}/${m}/${d}`;
  }, [tempDate]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2 border border-[#E1E6EC] rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-transparent text-gray-900 w-full text-left flex items-center justify-between ${className}`}
      >
        <span>{headerDate}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <IOSBottomSheet
        open={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        headerContent={
          <div className="flex items-center gap-3 justify-center">
            <div className="text-base sm:text-lg font-semibold text-gray-900">選擇日期 · <span className="text-[#007AFF]">{headerDate}</span></div>
            <button onClick={jumpToday} className="px-3 py-1 rounded-full bg-blue-50 text-[#007AFF] text-sm border border-[#A5D3FF] hover:bg-blue-100">今天</button>
          </div>
        }
      >
        <div className="bg-gray-50 p-4">
          <div className="flex gap-4 sm:gap-8 w-full">
            <WheelPicker
              value={tempDate.getFullYear()}
              options={years}
              onChange={(y) => setTempDate(new Date(y as number, tempDate.getMonth(), Math.min(tempDate.getDate(), new Date(y as number, tempDate.getMonth() + 1, 0).getDate())))}
              className="flex-1"
              autoScrollOnMount={false}
            />
            <WheelPicker
              value={tempDate.getMonth() + 1}
              options={months}
              onChange={(m) => setTempDate(new Date(tempDate.getFullYear(), (m as number) - 1, Math.min(tempDate.getDate(), new Date(tempDate.getFullYear(), m as number, 0).getDate())))}
              className="flex-1"
              autoScrollOnMount={false}
            />
            <WheelPicker
              value={tempDate.getDate()}
              options={days}
              onChange={(d) => setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), d as number))}
              className="flex-1"
              autoScrollOnMount={false}
            />
          </div>
        </div>
      </IOSBottomSheet>
    </div>
  );
}


