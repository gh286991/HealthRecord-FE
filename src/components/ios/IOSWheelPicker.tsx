'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import WheelPicker, { WheelOption } from '../WheelPicker';
import IOSBottomSheet from './IOSBottomSheet';

interface IOSWheelPickerProps<T extends string | number = string> {
  open: boolean;
  title?: string;
  options: WheelOption<T>[];
  value: T;
  onChange: (v: T) => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function IOSWheelPicker<T extends string | number = string>({ open, title, options, value, onChange, onClose, confirmText, cancelText }: IOSWheelPickerProps<T>) {
  const t = useTranslations();
  const defaultTitle = title || t('common.select');
  const defaultConfirmText = confirmText || t('common.done');
  const defaultCancelText = cancelText || t('common.cancel');
  const [temp, setTemp] = useState<T>(value);

  useEffect(() => setTemp(value), [value]);

  const headerLabel = useMemo(() => {
    const found = options.find(o => o.value === temp);
    return found?.label ?? '';
  }, [options, temp]);

  return (
    <IOSBottomSheet
      open={open}
      onClose={onClose}
      cancelText={defaultCancelText}
      confirmText={defaultConfirmText}
      onConfirm={() => { onChange(temp); onClose(); }}
      headerContent={<>{defaultTitle} · <span className="text-[#007AFF]">{headerLabel}</span></>}
    >
      <div className="bg-gray-50 p-4">
        <WheelPicker
          value={temp}
          options={options}
          onChange={(v) => setTemp(v as T)}
          className="w-full"
          autoScrollOnMount={false}
        />
      </div>
    </IOSBottomSheet>
  );
}


