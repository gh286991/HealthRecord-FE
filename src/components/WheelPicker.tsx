'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

export interface WheelOption<T extends string | number = number> {
  label: string;
  value: T;
}

interface WheelPickerProps<T extends string | number = number> {
  value: T;
  options: WheelOption<T>[];
  onChange: (v: T) => void;
  itemHeight?: number; // px
  className?: string;
  autoScrollOnMount?: boolean; // 首次掛載時是否自動捲動到 value
  autoScrollOnChange?: boolean; // value 變更時是否自動捲動
}

export default function WheelPicker<T extends string | number = number>({ value, options, onChange, itemHeight = 40, className = '', autoScrollOnMount = true, autoScrollOnChange = true }: WheelPickerProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedIndex = useMemo(() => Math.max(0, options.findIndex(o => o.value === value)), [options, value]);
  const snapStopTimer = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior) => {
    const el = containerRef.current;
    if (!el) return;
    const target = index * itemHeight;
    el.scrollTo({ top: target, behavior });
  }, [itemHeight]);

  // 初次掛載：可選是否對齊
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      if (autoScrollOnMount) {
        scrollToIndex(selectedIndex, 'auto');
      }
    }
  }, [mounted, autoScrollOnMount, scrollToIndex, selectedIndex]);

  // 當 value/選項 變更後：若已掛載，可選是否對齊
  useEffect(() => {
    if (!mounted) return;
    if (autoScrollOnChange) {
      scrollToIndex(selectedIndex, 'smooth');
    }
  }, [selectedIndex, mounted, autoScrollOnChange]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    if (snapStopTimer.current) window.clearTimeout(snapStopTimer.current);
    snapStopTimer.current = window.setTimeout(() => {
      const index = Math.round(el.scrollTop / itemHeight);
      const clamped = Math.max(0, Math.min(options.length - 1, index));
      scrollToIndex(clamped, 'smooth');
      const opt = options[clamped];
      if (opt && opt.value !== value) onChange(opt.value);
    }, 80);
  };

  return (
    <div className={`relative ${className}`} style={{ height: itemHeight * 5 }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory"
        style={{ paddingTop: itemHeight * 2, paddingBottom: itemHeight * 2 }}
      >
        {options.map((opt, idx) => (
          <div
            key={idx}
            className="snap-center flex items-center justify-center text-gray-500 w-full"
            style={{ height: itemHeight }}
          >
            <div className="mx-2 w-full">
              <span className={`block w-full text-center truncate transition-colors ${opt.value === value ? 'text-[#007AFF] font-semibold' : ''}`}>{opt.label}</span>
            </div>
          </div>
        ))}
      </div>
      {/* 中線高亮區 */}
      <div
        className="pointer-events-none absolute left-0 right-0 flex items-center"
        style={{ top: itemHeight * 2, height: itemHeight }}
      >
        <div className="w-full mx-2 rounded-lg border-2 border-[#007AFF]" style={{ height: itemHeight - 14 }} />
      </div>
      {/* 上下漸層遮罩 */}
      <div className="pointer-events-none absolute left-0 right-0 top-0" style={{ height: itemHeight * 2, background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
      <div className="pointer-events-none absolute left-0 right-0 bottom-0" style={{ height: itemHeight * 2, background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
    </div>
  );
}
