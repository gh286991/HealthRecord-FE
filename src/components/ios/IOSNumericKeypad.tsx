'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import IOSBottomSheet from './IOSBottomSheet';

interface IOSNumericKeypadProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  title?: string;
  initialValue?: number | string;
  allowDecimal?: boolean;
  className?: string;
}

export default function IOSNumericKeypad({
  open,
  onClose,
  onConfirm,
  title,
  initialValue = '',
  allowDecimal = false,
  className = ''
}: IOSNumericKeypadProps) {
  const t = useTranslations();
  const defaultTitle = title || t('common.enterValue');
  const [inputStr, setInputStr] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    const val = String(initialValue ?? '');
    setInputStr(val);
  }, [open, initialValue]);

  const display = useMemo(() => (inputStr === '' ? '0' : inputStr), [inputStr]);

  const append = (ch: string) => {
    setInputStr(prev => {
      if (ch === '.') {
        if (!allowDecimal) return prev;
        if (prev.includes('.')) return prev;
        if (prev === '' || prev === '-') return '0.';
        return prev + '.';
      }
      // digits
      if (ch >= '0' && ch <= '9') {
        if (prev === '0') return ch; // prevent leading zero
        return prev + ch;
      }
      return prev;
    });
  };

  const backspace = () => setInputStr(prev => prev.slice(0, -1));
  const clear = () => setInputStr('');

  const handleConfirm = () => {
    const num = allowDecimal ? parseFloat(inputStr || '0') : parseInt(inputStr || '0', 10);
    onConfirm(Number.isFinite(num) ? num : 0);
  };

  if (!open) return null;

  return (
    <IOSBottomSheet
      open={open}
      onClose={onClose}
      title={defaultTitle}
      onConfirm={handleConfirm}
      className={className}
    >
      <div className="p-4">
        <div className="mb-3">
          <input
            value={display}
            readOnly
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-right text-3xl text-gray-900 font-semibold tabular-nums"
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => append('7')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">7</button>
          <button onClick={() => append('8')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">8</button>
          <button onClick={() => append('9')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">9</button>
          <button onClick={backspace} className="py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium">⌫</button>

          <button onClick={() => append('4')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">4</button>
          <button onClick={() => append('5')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">5</button>
          <button onClick={() => append('6')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">6</button>
          <button onClick={clear} className="py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium">{t('common.clear')}</button>

          <button onClick={() => append('1')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">1</button>
          <button onClick={() => append('2')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">2</button>
          <button onClick={() => append('3')} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">3</button>
          <button
            onClick={() => allowDecimal ? append('.') : append('0')}
            className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium"
          >
            {allowDecimal ? '.' : '0'}
          </button>

          <button onClick={() => append('0')} className="col-span-3 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium">0</button>
          <button onClick={handleConfirm} className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">{t('common.done')}</button>
        </div>
      </div>
    </IOSBottomSheet>
  );
}


