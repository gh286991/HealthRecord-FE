'use client';

import { useMemo } from 'react';

interface IOSWeekStripProps {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

function toDateOnlyISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function IOSWeekStrip({ selectedDate, onChange }: IOSWeekStripProps) {
  const selected = useMemo(() => new Date(selectedDate), [selectedDate]);

  // 以選中日期所在週（一周從週一開始）
  const days = useMemo(() => {
    const dayOfWeek = (selected.getDay() + 6) % 7; // 0=週一 ... 6=週日
    const monday = new Date(selected);
    monday.setDate(selected.getDate() - dayOfWeek);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [selected]);

  const weekNames = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-1">
        {days.map((d, i) => {
          const iso = toDateOnlyISO(d);
          const isActive = iso === selectedDate;
          return (
            <button
              key={iso}
              onClick={() => onChange(iso)}
              className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl transition-colors ${
                isActive ? 'bg-teal-600 text-white' : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs opacity-80">{weekNames[i]}</span>
              <span className="text-lg font-semibold leading-5">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


