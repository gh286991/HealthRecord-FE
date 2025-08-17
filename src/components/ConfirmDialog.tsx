'use client';

import React from 'react';
import Button from './Button';

export default function ConfirmDialog({
  open,
  title = '確認',
  message = '確定要執行此操作嗎？',
  confirmText = '確定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative w-[min(92vw,420px)] rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,.12)] p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}


