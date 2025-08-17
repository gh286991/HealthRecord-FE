'use client';

import React, { useEffect } from 'react';

type Variant = 'default' | 'success' | 'error';

export default function Toast({
  open,
  message,
  variant = 'default',
  onClose,
  duration = 1600,
}: {
  open: boolean;
  message: string | null;
  variant?: Variant;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  const colors: Record<Variant, string> = {
    default: 'bg-gray-900/90 text-white',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
  };

  return (
    <div
      className={`pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 ${
        open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      style={{ width: 'min(560px, 90vw)' }}
    >
      <div className={`px-4 py-3 rounded-xl shadow-[0_6px_24px_rgba(0,0,0,.12)] border border-white/10 text-sm text-center ${colors[variant]}`}>
        {message}
      </div>
    </div>
  );
}


